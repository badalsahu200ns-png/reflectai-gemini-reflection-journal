import React, { createContext, useContext, useEffect, useState, FC, ReactNode } from 'react';
import {
  User,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  signInAnonymously
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/config';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInAsDemoUser: (customName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync user profile document with Firestore
  const syncUserProfile = async (u: User, isDemo = false, demoName?: string) => {
    try {
      const userRef = doc(db, 'users', u.uid);
      const userSnap = await getDoc(userRef);

      const profileData: UserProfile = {
        uid: u.uid,
        email: u.email || (isDemo ? `${u.uid.slice(0, 8)}@demo.reflectai.internal` : null),
        displayName: demoName || u.displayName || (isDemo ? 'Journal Explorer (Demo)' : 'Anonymous Thinker'),
        photoURL: u.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.uid}`,
        isAnonymous: u.isAnonymous || isDemo,
        createdAt: new Date().toISOString()
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
      console.warn('Could not sync user profile to Firestore (possibly offline or initial setup):', err);
      // Fallback local user object
      setUser({
        uid: u.uid,
        email: u.email,
        displayName: demoName || u.displayName || 'Reflective User',
        photoURL: u.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.uid}`,
        isAnonymous: u.isAnonymous
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currUser) => {
      setFirebaseUser(currUser);
      if (currUser) {
        await syncUserProfile(currUser);
      } else {
        // Check if demo user stored locally
        const savedDemo = localStorage.getItem('reflectai_demo_user');
        if (savedDemo) {
          try {
            setUser(JSON.parse(savedDemo));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await syncUserProfile(result.user);
        localStorage.removeItem('reflectai_demo_user');
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      const code = err.code || '';
      if (code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups or use Demo Mode.');
      } else if (code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled by user.');
      } else if (code === 'auth/cancelled-popup-request') {
        // Ignored
      } else {
        setError(err.message || 'Failed to sign in with Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const signInAsDemoUser = async (customName = 'Badal Sahu') => {
    setLoading(true);
    setError(null);
    try {
      // Create anonymous auth user in Firebase if enabled or simulated isolated session
      let demoUid = localStorage.getItem('reflectai_demo_uid');
      if (!demoUid) {
        demoUid = 'demo-user-' + Math.random().toString(36).substring(2, 11);
        localStorage.setItem('reflectai_demo_uid', demoUid);
      }

      const demoProfile: UserProfile = {
        uid: demoUid,
        email: 'badalsahu200ns@gmail.com',
        displayName: customName,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${demoUid}`,
        isAnonymous: true,
        createdAt: new Date().toISOString()
      };

      try {
        await signInAnonymously(auth);
      } catch (e) {
        // Local isolated demo session fallback
      }

      setUser(demoProfile);
      localStorage.setItem('reflectai_demo_user', JSON.stringify(demoProfile));
    } catch (err: any) {
      console.error('Demo Sign-In Error:', err);
      setError(err.message || 'Failed to initialize session.');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('reflectai_demo_user');
      await fbSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (err: any) {
      console.error('Sign Out Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        error,
        signInWithGoogle,
        signInAsDemoUser,
        signOut,
        clearError
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
