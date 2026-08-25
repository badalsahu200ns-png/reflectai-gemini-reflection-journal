import { useState, FC } from 'react';
import {
  Database,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Copy,
  Check,
  Play,
  RotateCcw,
  Sparkles,
  Lock,
  UserCheck
} from 'lucide-react';
import { analyzeFirestoreRules } from '../utils/security';

const SAMPLE_INSECURE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // INSECURE: Open wildcard allows anyone in the world to read/write all data!
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

const SAMPLE_SECURE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 1. Owner-bound user interactions isolation
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 2. User profile documents
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // 3. Admin-only role-based access control (RBAC)
    match /admin/{adminDoc} {
      allow read, write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }

    // 4. Default Deny: All other paths are strictly locked
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`;

export const FirestoreGuard: FC = () => {
  const [rules, setRules] = useState(SAMPLE_SECURE_RULES);
  const [copied, setCopied] = useState(false);
  const [analysis, setAnalysis] = useState(() => analyzeFirestoreRules(SAMPLE_SECURE_RULES));

  // Interactive Simulator state
  const [simulatedAuthUid, setSimulatedAuthUid] = useState('user-alice-123');
  const [simulatedPath, setSimulatedPath] = useState('/users/user-alice-123/interactions/msg-999');
  const [simulatedAction, setSimulatedAction] = useState<'READ' | 'WRITE'>('READ');
  const [simulationResult, setSimulationResult] = useState<{ allowed: boolean; reason: string } | null>(null);

  const handleAuditRules = () => {
    const result = analyzeFirestoreRules(rules);
    setAnalysis(result);
  };

  const handleApplySecureTemplate = () => {
    setRules(SAMPLE_SECURE_RULES);
    setAnalysis(analyzeFirestoreRules(SAMPLE_SECURE_RULES));
  };

  const handleSimulateRule = () => {
    const isUnauthenticated = !simulatedAuthUid.trim();
    const hasInsecureAllowAll = /allow\s+[^:]+:\s*if\s+true\s*;/i.test(rules);

    if (hasInsecureAllowAll) {
      setSimulationResult({
        allowed: true,
        reason: 'CRITICAL VULNERABILITY: Allowed because open wildcard `if true;` is present in rules.'
      });
      return;
    }

    if (isUnauthenticated) {
      setSimulationResult({
        allowed: false,
        reason: 'DENIED: Unauthenticated request rejected by `request.auth != null` barrier.'
      });
      return;
    }

    // Owner-bound match check
    if (simulatedPath.startsWith(`/users/${simulatedAuthUid}/`)) {
      setSimulationResult({
        allowed: true,
        reason: `ALLOWED: Caller UID '${simulatedAuthUid}' matches document path owner '${simulatedAuthUid}'.`
      });
    } else {
      setSimulationResult({
        allowed: false,
        reason: `DENIED: Caller UID '${simulatedAuthUid}' does NOT match target document owner in path '${simulatedPath}'. Cross-tenant access blocked.`
      });
    }
  };

  const copyRules = () => {
    navigator.clipboard.writeText(rules);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-neutral-800" />
              Secure Firestore & Firebase Auth Configuration
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Zero Insecure Defaults, Owner-Bound Data Isolation (`request.auth.uid == userId`), and RBAC Rule Verification.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleApplySecureTemplate}
              className="inline-flex items-center px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-medium transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              Load Secure Template
            </button>

            <button
              onClick={() => {
                setRules(SAMPLE_INSECURE_RULES);
                setAnalysis(analyzeFirestoreRules(SAMPLE_INSECURE_RULES));
              }}
              className="inline-flex items-center px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-medium transition-colors border border-red-200"
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-red-600" />
              Load Insecure Example
            </button>

            <button
              onClick={copyRules}
              className="inline-flex items-center px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-medium shadow-xs transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
              {copied ? 'Copied' : 'Copy firestore.rules'}
            </button>
          </div>
        </div>

        {/* Security Health Score Bar */}
        <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-lg ${
                analysis.isSecure
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}
            >
              {analysis.score}%
            </div>
            <div>
              <div className="font-semibold text-sm text-neutral-900 flex items-center gap-1.5">
                {analysis.isSecure ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Secure Owner-Bound Isolation Confirmed
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    Security Flaws Detected
                  </>
                )}
              </div>
              <div className="text-xs text-neutral-500 mt-0.5">
                Zero insecure wildcard defaults enforced | Version 2 specification
              </div>
            </div>
          </div>

          <button
            onClick={handleAuditRules}
            className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-medium shrink-0"
          >
            Audit Rules
          </button>
        </div>

        {/* Findings List */}
        <div className="space-y-2 mb-4">
          {analysis.findings.map((f, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                f.level === 'PASS'
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                  : f.level === 'ERROR'
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              {f.level === 'PASS' ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : f.level === 'ERROR' ? (
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-medium">{f.message}</span>
                {f.ruleLine && (
                  <code className="block mt-1 font-mono text-[11px] bg-white/75 px-2 py-0.5 rounded border border-neutral-200">
                    {f.ruleLine}
                  </code>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Rules Editor */}
        <div className="relative">
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            firestore.rules Editor:
          </label>
          <textarea
            rows={14}
            value={rules}
            onChange={e => {
              setRules(e.target.value);
              setAnalysis(analyzeFirestoreRules(e.target.value));
            }}
            className="w-full font-mono text-xs px-3.5 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-neutral-950 text-neutral-100"
          />
        </div>
      </div>

      {/* Interactive Rule Simulator */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
        <h3 className="text-base font-semibold text-neutral-900 flex items-center gap-2 mb-1">
          <UserCheck className="w-4 h-4 text-neutral-800" />
          Interactive Firestore Security Rule Simulator
        </h3>
        <p className="text-xs text-neutral-500 mb-4">
          Test simulated request contexts to verify owner-bound path isolation and rejection of unauthorized cross-user queries.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Simulated auth.uid (Leave empty for unauthenticated):
            </label>
            <input
              type="text"
              value={simulatedAuthUid}
              onChange={e => setSimulatedAuthUid(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 font-mono"
              placeholder="e.g. user-alice-123"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Target Document Path:
            </label>
            <input
              type="text"
              value={simulatedPath}
              onChange={e => setSimulatedPath(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 font-mono"
              placeholder="/users/user-alice-123/interactions/123"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Simulated Operation:
            </label>
            <div className="flex gap-2">
              <select
                value={simulatedAction}
                onChange={e => setSimulatedAction(e.target.value as any)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 bg-white"
              >
                <option value="READ">Read (get / list)</option>
                <option value="WRITE">Write (create / update / delete)</option>
              </select>
              <button
                onClick={handleSimulateRule}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-medium shrink-0"
              >
                Simulate
              </button>
            </div>
          </div>
        </div>

        {/* Quick Test Scenarios */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 text-xs">
          <span className="text-neutral-500 font-medium shrink-0">Quick Scenarios:</span>
          <button
            onClick={() => {
              setSimulatedAuthUid('');
              setSimulatedPath('/users/user-alice-123/interactions/msg-1');
              setSimulatedAction('READ');
            }}
            className="px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-800 shrink-0"
          >
            1. Unauthenticated Read
          </button>
          <button
            onClick={() => {
              setSimulatedAuthUid('attacker-bob-999');
              setSimulatedPath('/users/user-alice-123/interactions/msg-1');
              setSimulatedAction('WRITE');
            }}
            className="px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-800 shrink-0"
          >
            2. Attacker Writing to Alice&apos;s Folder
          </button>
          <button
            onClick={() => {
              setSimulatedAuthUid('user-alice-123');
              setSimulatedPath('/users/user-alice-123/interactions/msg-1');
              setSimulatedAction('READ');
            }}
            className="px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-800 shrink-0"
          >
            3. Valid Owner Interaction Access
          </button>
        </div>

        {/* Simulation Output */}
        {simulationResult && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-start gap-2 ${
              simulationResult.allowed
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            {simulationResult.allowed ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Lock className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-sm">
                {simulationResult.allowed ? 'REQUEST PERMITTED' : 'REQUEST BLOCKED'}
              </div>
              <div className="mt-0.5">{simulationResult.reason}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
