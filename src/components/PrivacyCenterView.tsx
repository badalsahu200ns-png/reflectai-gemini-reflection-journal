import React, { useState } from 'react';
import {
  ShieldCheck,
  Download,
  Trash2,
  Lock,
  Server,
  FileJson,
  FileSpreadsheet,
  Printer,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Info,
  EyeOff,
  RefreshCw,
  KeyRound,
  Database
} from 'lucide-react';
import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { JournalEntry, AIMemory } from '../types';

interface PrivacyCenterViewProps {
  entries: JournalEntry[];
  memories?: AIMemory[];
  onRefreshData?: () => void;
  onOpenSecurityInspector?: () => void;
}

export const PrivacyCenterView: React.FC<PrivacyCenterViewProps> = ({
  entries,
  memories = [],
  onRefreshData,
  onOpenSecurityInspector
}) => {
  const { user, signOut } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmationStep, setDeleteConfirmationStep] = useState<0 | 1 | 2>(0);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  // 1. Export as JSON
  const handleExportJSON = () => {
    const payload = {
      exportMetadata: {
        app: 'ReflectAI',
        exportedAt: new Date().toISOString(),
        userUid: user?.uid,
        totalEntries: entries.length,
        totalMemories: memories.length
      },
      entries,
      memories
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ReflectAI_Journal_Export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportSuccessMsg('JSON vault backup downloaded successfully.');
    setTimeout(() => setExportSuccessMsg(null), 4000);
  };

  // 2. Export as CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Title', 'Category', 'Mood', 'MoodScale', 'Tags', 'WordCount', 'Content'];
    const rows = entries.map((e) => {
      const date = e.createdAt ? new Date(e.createdAt).toISOString() : '';
      const title = `"${(e.title || '').replace(/"/g, '""')}"`;
      const category = `"${(e.category || '').replace(/"/g, '""')}"`;
      const mood = `"${(e.mood || '').replace(/"/g, '""')}"`;
      const moodScale = e.moodScale || '';
      const tags = `"${(e.tags || []).join(';')}"`;
      const wordCount = e.wordCount || 0;
      const text = e.content || (e.turns ? e.turns.map((t) => t.content).join(' ') : '');
      const content = `"${text.replace(/"/g, '""')}"`;

      return [e.id, date, title, category, mood, moodScale, tags, wordCount, content].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers.join(','), ...rows].join('\n'));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute('download', `ReflectAI_Entries_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportSuccessMsg('CSV table export downloaded successfully.');
    setTimeout(() => setExportSuccessMsg(null), 4000);
  };

  // 3. Print / PDF Export
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>ReflectAI - Personal Journal Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
    h1 { color: #581c87; margin-bottom: 4px; }
    .meta { color: #666; font-size: 13px; margin-bottom: 24px; }
    .entry { border-bottom: 1px solid #ddd; padding: 20px 0; page-break-inside: avoid; }
    .entry-title { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
    .entry-meta { font-size: 12px; color: #777; margin-bottom: 12px; }
    .entry-content { font-size: 14px; white-space: pre-wrap; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; background: #f3e8ff; color: #6b21a8; font-size: 11px; margin-right: 6px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>ReflectAI Personal Journal Archive</h1>
  <div class="meta">Exported on ${new Date().toLocaleDateString()} | Total Entries: ${entries.length}</div>
  <hr />
  ${entries
    .map((e) => {
      const text = e.content || (e.turns ? e.turns.map((t) => `${t.role.toUpperCase()}: ${t.content}`).join('\n\n') : '');
      return `
      <div class="entry">
        <div class="entry-title">${e.title || 'Untitled Reflection'}</div>
        <div class="entry-meta">
          <span>Date: ${new Date(e.createdAt).toLocaleDateString()}</span> | 
          <span class="badge">${e.category || 'Reflection'}</span>
          <span class="badge">Mood: ${e.mood || 'Thoughtful'}</span>
          ${(e.tags || []).map((t) => `<span class="badge">#${t}</span>`).join(' ')}
        </div>
        <div class="entry-content">${text}</div>
      </div>
    `;
    })
    .join('')}
  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // 4. Cascading Account Data Deletion
  const handleExecuteCascadingDelete = async () => {
    if (!user?.uid || deleteConfirmationText !== 'DELETE') return;

    setIsDeleting(true);
    try {
      // 1. Delete all user entries
      const entriesRef = collection(db, 'users', user.uid, 'entries');
      const entriesSnap = await getDocs(entriesRef);
      await Promise.all(entriesSnap.docs.map((d) => deleteDoc(d.ref)));

      // 2. Delete all user memories
      const memsRef = collection(db, 'users', user.uid, 'memories');
      const memsSnap = await getDocs(memsRef);
      await Promise.all(memsSnap.docs.map((d) => deleteDoc(d.ref)));

      // 3. Delete weekly summaries
      const weeklyRef = collection(db, 'users', user.uid, 'weeklySummaries');
      const weeklySnap = await getDocs(weeklyRef);
      await Promise.all(weeklySnap.docs.map((d) => deleteDoc(d.ref)));

      // 4. Delete monthly summaries
      const monthlyRef = collection(db, 'users', user.uid, 'monthlySummaries');
      const monthlySnap = await getDocs(monthlyRef);
      await Promise.all(monthlySnap.docs.map((d) => deleteDoc(d.ref)));

      // 5. Clear Local Storage keys
      localStorage.removeItem(`reflectai_entries_${user.uid}`);
      localStorage.removeItem(`reflectai_memories_${user.uid}`);
      localStorage.removeItem(`reflectai_ai_memory_enabled_${user.uid}`);

      // 6. Sign out user cleanly
      await signOut();
    } catch (err: any) {
      console.error('Error during cascading data deletion:', err);
      alert('Error during data deletion: ' + err.message);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmationStep(0);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-neutral-900 text-neutral-100" id="privacy-center-root">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-purple-950/40 border border-neutral-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Privacy & Data Sovereignty Center
              </h1>
            </div>
            <p className="text-xs text-neutral-400 max-w-xl">
              Your journal is an intimate sanctuary. ReflectAI enforces strict owner-bound database rules, zero third-party telemetry, and gives you total sovereignty over your data.
            </p>
          </div>
        </div>

        {exportSuccessMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2.5 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{exportSuccessMsg}</span>
          </div>
        )}

        {/* Security Architecture Guarantees */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Lock className="w-4 h-4 text-emerald-400" />
              Owner-Bound Isolation
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Every document is strictly locked at <span className="font-mono text-emerald-400 text-[10px]">/users/{user?.uid ? `${user.uid.slice(0, 6)}...` : 'uid'}/entries</span> enforcing <span className="font-mono text-[10px]">request.auth.uid == userId</span>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Server className="w-4 h-4 text-purple-400" />
              Server-Proxied AI Keys
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Gemini API keys and prompts are processed strictly server-side. No API keys or credentials ever reach client-side javascript.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <EyeOff className="w-4 h-4 text-indigo-400" />
              Zero Third-Party Ads
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Zero ad trackers, zero telemetry scripts, and zero public exposure of personal journal entries. Your thoughts remain private.
            </p>
          </div>
        </div>

        {/* External Notifications & Webhooks Privacy Card */}
        <div className="p-5 rounded-2xl bg-neutral-950/90 border border-neutral-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>External Notification Privacy Architecture (Slack, Discord & Email)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-neutral-400">
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 space-y-1">
              <span className="font-semibold text-white block">Minimal Payload Default</span>
              <p className="leading-relaxed">
                By default, alerts sent to Slack, Discord, and Email contain only event titles and deep links. Real journal text is never sent without explicit opt-in.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 space-y-1">
              <span className="font-semibold text-white block">Zero Secret Storage</span>
              <p className="leading-relaxed">
                Webhook URLs and credentials are never placed in public repositories or exposed to other users. Audit logs record execution without credentials.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 space-y-1">
              <span className="font-semibold text-white block">One-Click Revocation</span>
              <p className="leading-relaxed">
                Disconnecting any webhook or email service immediately purges all integration mappings and stops all outbound event triggers.
              </p>
            </div>
          </div>
        </div>

        {/* Data Export & Backup Section */}
        <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-purple-400" />
                Complete Data Export & Portability
              </h2>
              <p className="text-[11px] text-neutral-400">
                Download your full reflection history in standard machine-readable or printable formats at any time.
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-400 bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800">
              {entries.length} Entries • {memories.length} Memories
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              onClick={handleExportJSON}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-purple-500/50 text-white text-xs font-semibold transition-all shadow-sm active:scale-98"
            >
              <FileJson className="w-4 h-4 text-yellow-400" />
              <span>Export JSON Vault</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-emerald-500/50 text-white text-xs font-semibold transition-all shadow-sm active:scale-98"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export CSV Table</span>
            </button>

            <button
              onClick={handlePrintReport}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-indigo-500/50 text-white text-xs font-semibold transition-all shadow-sm active:scale-98"
            >
              <Printer className="w-4 h-4 text-indigo-400" />
              <span>Printable Report / PDF</span>
            </button>
          </div>
        </div>

        {/* Danger Zone: Cascading Data Deletion */}
        <div className="p-6 rounded-2xl bg-red-950/20 border border-red-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold text-red-400 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-400" />
                Permanently Delete All My Data (GDPR / CCPA)
              </h2>
              <p className="text-[11px] text-neutral-400">
                Immediately deletes all journal entries, AI memories, summaries, and user records across Cloud Firestore. This operation is irreversible.
              </p>
            </div>
            <button
              onClick={() => setDeleteConfirmationStep(1)}
              className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-200 hover:text-white border border-red-800 text-xs font-bold transition-all"
            >
              Delete All Data
            </button>
          </div>
        </div>
      </div>

      {/* Cascading Deletion Multi-Step Confirmation Modal */}
      {deleteConfirmationStep > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-neutral-900 border border-red-900 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-white">Permanently Erase All Data?</h3>
                <p className="text-[11px] text-red-300">Irreversible Cascading Firestore Purge</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              This action will completely delete all <span className="font-semibold text-white">{entries.length} reflections</span>, <span className="font-semibold text-white">{memories.length} AI memories</span>, and all weekly/monthly retrospectives associated with your account.
            </p>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <label className="block text-[11px] text-neutral-400">
                Type <span className="font-mono text-red-400 font-bold">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setDeleteConfirmationStep(0);
                  setDeleteConfirmationText('');
                }}
                className="px-3 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteCascadingDelete}
                disabled={deleteConfirmationText !== 'DELETE' || isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow"
              >
                {isDeleting ? 'Purging Firestore Records...' : 'Permanently Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
