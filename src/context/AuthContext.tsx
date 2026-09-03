import React, { createContext, useContext, useEffect, useState, FC, ReactNode, useCallback } from 'react';
import {
  User,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/config';
import { UserProfile, AuthState, OtpChallengeState } from '../types';

interface PendingAuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

interface AuthContextType {
  authState: AuthState;
  user: UserProfile | null;
  pendingUser: PendingAuthUser | null;
  firebaseUser: User | null;
  loading: boolean;
  error: string | null;
  otpState: OtpChallengeState;
  signInWithGoogle: () => Promise<void>;
  verifyOtp: (code: string) => Promise<boolean>;
  resendOtp: () => Promise<void>;
  changeAccount: () => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  secureLogout: () => Promise<void>;
  clearError: () => void;
  updateProfileAvatar: (photoURL: string) => Promise<void>;
}

const initialOtpState: OtpChallengeState = {
  challengeId: null,
  maskedEmail: '',
  expiresAt: null,
  cooldownSeconds: 0,
  isSending: false,
  isVerifying: false,
  error: null,
  attemptsRemaining: 5
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Wipes all temporary sensitive keys, journal drafts, and session tokens
 * across both sessionStorage and localStorage.
 */
function wipeTemporarySensitiveData(uid?: string) {
  try {
    // 1. Clean sessionStorage
    const sessionKeysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (
        key.startsWith('reflectai_') ||
        key.startsWith('draft_') ||
        key.startsWith('otp_') ||
        key.includes('token') ||
        key.includes('session') ||
        (uid && key.includes(uid))
      )) {
        sessionKeysToRemove.push(key);
      }
    }
    sessionKeysToRemove.forEach(k => sessionStorage.removeItem(k));

    // 2. Clean sensitive items in localStorage (preserving non-sensitive preferences like theme)
    const localKeysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('reflectai_draft_') ||
        key.startsWith('reflectai_cache_') ||
        key.startsWith('draft_') ||
        key.includes('temp_journal') ||
        (uid && key.includes(uid))
      )) {
        localKeysToRemove.push(key);
      }
    }
    localKeysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (err) {
    console.warn('[AuthContext] Temporary data wipe notice:', err);
  }
}

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>('UNAUTHENTICATED');
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [pendingUser, setPendingUser] = useState<PendingAuthUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [otpState, setOtpState] = useState<OtpChallengeState>(initialOtpState);

  // Sync user profile document with Firestore
  const syncUserProfile = async (u: User, emailToUse: string, displayNameToUse: string, photoToUse: string) => {
    try {
      const cachedAvatar = localStorage.getItem(`reflectai_avatar_${u.uid}`);
      const userRef = doc(db, 'users', u.uid);
      const userSnap = await getDoc(userRef);

      const existingData = userSnap.exists() ? userSnap.data() : null;
      const finalPhoto = existingData?.photoURL || cachedAvatar || photoToUse || u.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.uid}`;

      const profileData: UserProfile = {
        uid: u.uid,
        email: emailToUse || u.email || 'verified.user@gmail.com',
        displayName: existingData?.displayName || displayNameToUse || u.displayName || 'ReflectAI User',
        photoURL: finalPhoto,
        isAnonymous: false,
        createdAt: existingData?.createdAt || new Date().toISOString()
      };

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          ...profileData,
          firestoreCreatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        });
      } else {
        await setDoc(userRef, {
          lastLoginAt: serverTimestamp()
        }, { merge: true });
      }

      setUser(profileData);
    } catch (err: any) {
      console.warn('Could not sync user profile to Firestore (possibly initial offline or rule propagation):', err);
      const cachedAvatar = localStorage.getItem(`reflectai_avatar_${u.uid}`);
      // Fallback local user object
      setUser({
        uid: u.uid,
        email: emailToUse || u.email,
        displayName: displayNameToUse || u.displayName || 'ReflectAI User',
        photoURL: cachedAvatar || photoToUse || u.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.uid}`,
        isAnonymous: false
      });
    }
  };

  // Auth state listener on page load / auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currUser) => {
      setFirebaseUser(currUser);

      if (currUser) {
        await syncUserProfile(
          currUser,
          currUser.email || '',
          currUser.displayName || 'ReflectAI User',
          currUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currUser.uid}`
        );
        setAuthState('APPLICATION_ACCESS_GRANTED');
      } else {
        setAuthState('UNAUTHENTICATED');
        setUser(null);
        setPendingUser(null);
        setOtpState(initialOtpState);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google Sign-In with popup
  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await syncUserProfile(
          result.user,
          result.user.email || '',
          result.user.displayName || 'ReflectAI User',
          result.user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${result.user.uid}`
        );
        setAuthState('APPLICATION_ACCESS_GRANTED');
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      const code = err.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setError('Login cancelled. You can sign in whenever you are ready.');
      } else if (code === 'auth/popup-blocked') {
        setError('Google sign-in popup was blocked by your browser. Please allow popups for this site and try again.');
      } else {
        setError(err.message || 'Failed to sign in with Google. Please try again.');
      }
      setAuthState('UNAUTHENTICATED');
    } finally {
      setLoading(false);
    }
  };

  // Backward-compatible no-op for OTP verify
  const verifyOtp = async (_code: string): Promise<boolean> => {
    setAuthState('APPLICATION_ACCESS_GRANTED');
    return true;
  };

  // Backward-compatible no-op for OTP resend
  const resendOtp = async () => {};

  // Change account: sign out from Firebase, return to login
  const changeAccount = async () => {
    setLoading(true);
    try {
      const targetUid = pendingUser?.uid || user?.uid;
      wipeTemporarySensitiveData(targetUid);
      await fbSignOut(auth);
      setPendingUser(null);
      setUser(null);
      setFirebaseUser(null);
      setOtpState(initialOtpState);
      setAuthState('UNAUTHENTICATED');
      setError(null);
    } catch (err: any) {
      console.error('changeAccount error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Secure Logout Utility:
   * 1. Clears the Firebase Authentication session
   * 2. Resets all local React auth states
   * 3. Wipes temporary sensitive data (sessionStorage tokens, drafts, cached state)
   * 4. Redirects immediately back to the Login view
   */
  const secureLogout = useCallback(async () => {
    setLoading(true);
    try {
      const targetUid = user?.uid || pendingUser?.uid || firebaseUser?.uid;
      // Wipe sensitive storage keys
      wipeTemporarySensitiveData(targetUid);

      // Sign out from Firebase
      await fbSignOut(auth);

      // Reset all internal states
      setUser(null);
      setPendingUser(null);
      setFirebaseUser(null);
      setOtpState(initialOtpState);
      setAuthState('UNAUTHENTICATED');
      setError(null);
    } catch (err: any) {
      console.error('secureLogout error:', err);
      setError(err.message || 'Failed to logout securely.');
    } finally {
      setLoading(false);
    }
  }, [user, pendingUser, firebaseUser]);

  const updateProfileAvatar = async (photoURL: string) => {
    if (!user) return;
    const updatedUser: UserProfile = { ...user, photoURL };
    setUser(updatedUser);
    try {
      localStorage.setItem(`reflectai_avatar_${user.uid}`, photoURL);
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { photoURL, updatedAt: serverTimestamp() }, { merge: true });
    } catch (err) {
      console.warn('Could not persist avatar to Firestore, saved to local cache:', err);
    }
  };

  const signOut = secureLogout;
  const logout = secureLogout;

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        authState,
        user,
        pendingUser,
        firebaseUser,
        loading,
        error,
        otpState,
        signInWithGoogle,
        verifyOtp,
        resendOtp,
        changeAccount,
        signOut,
        logout,
        secureLogout,
        clearError,
        updateProfileAvatar
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
