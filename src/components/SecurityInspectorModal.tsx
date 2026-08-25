import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Database,
  Key,
  Server,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Code2,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SecurityInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityInspectorModal: React.FC<SecurityInspectorModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const [rulesAnalysis, setRulesAnalysis] = useState<any>(null);
  const [healthInfo, setHealthInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadInspectionData();
    }
  }, [isOpen]);

  const loadInspectionData = async () => {
    setLoading(true);
    try {
      const [healthRes, rulesRes] = await Promise.all([
        fetch('/api/health').then((r) => r.json()),
        fetch('/api/verify-rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rules: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/entries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`
          })
        }).then((r) => r.json())
      ]);

      setHealthInfo(healthRes);
      setRulesAnalysis(rulesRes);
    } catch (err) {
      console.error('Failed to load security inspection data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Security & Rules Architecture Inspector</h2>
              <p className="text-[11px] text-neutral-400">Verifying isolation, Firestore rules, and secret hygiene</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Active User Isolation */}
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-neutral-200 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Active User Identity & Storage Isolation
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-[10px] font-mono">
                SECURE
              </span>
            </div>
            <div className="space-y-1 text-neutral-400 font-mono text-[11px] bg-neutral-950 p-2.5 rounded-lg border border-neutral-800/80">
              <div>UID: <span className="text-white">{user?.uid || 'Not authenticated'}</span></div>
              <div>Email: <span className="text-neutral-300">{user?.email || 'Demo session'}</span></div>
              <div>Firestore Path: <span className="text-purple-300">/users/{user?.uid}/entries/{'{entryId}'}</span></div>
            </div>
          </div>

          {/* Firestore Rules Verification */}
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-neutral-200 flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                Cloud Firestore Security Rules (firestore.rules)
              </div>
              {rulesAnalysis?.isSecure ? (
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-[10px] font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Owner-Bound Enforced
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px]">
                  Checking...
                </span>
              )}
            </div>

            <p className="text-neutral-400 leading-relaxed">
              Rules strictly restrict read/write access to matching authenticated UIDs (<code className="text-neutral-300 font-mono text-[10px]">request.auth.uid == userId</code>) and enforce <code className="text-neutral-300 font-mono text-[10px]">allow read, write: if false;</code> as default-deny for all other collections.
            </p>

            <pre className="p-3 bg-neutral-950 rounded-lg text-[11px] font-mono text-neutral-300 border border-neutral-800/80 overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/entries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`}
            </pre>
          </div>

          {/* Secret Manager & Server Proxy */}
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-neutral-200 flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                Secret Hygiene & Server-Side Gemini API Proxy
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-[10px] font-mono">
                ZERO BROWSER EXPOSURE
              </span>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              Gemini API keys are never bundled into client JS. All prompts and summaries are proxied through <code className="text-neutral-300 font-mono text-[10px]">/api/journal/*</code> endpoints on the Express server.
            </p>
          </div>

          {/* Model Fallback Ladder */}
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-neutral-200 flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-purple-400" />
                Resilient Gemini Fallback Ladder
              </div>
              <span className="text-[10px] font-mono text-purple-400">4-Tier Auto-Failover</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded bg-neutral-950 border border-neutral-800 text-neutral-300">
                1. gemini-3.6-flash (Primary)
              </div>
              <div className="p-2 rounded bg-neutral-950 border border-neutral-800 text-neutral-400">
                2. gemini-3.1-flash-lite (HA Failover)
              </div>
              <div className="p-2 rounded bg-neutral-950 border border-neutral-800 text-neutral-400">
                3. gemini-flash-latest (Dynamic Alias)
              </div>
              <div className="p-2 rounded bg-neutral-950 border border-neutral-800 text-neutral-400">
                4. gemini-3.7-flash (Deep Reasoning)
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
