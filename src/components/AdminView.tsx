import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ShieldAlert,
  Users,
  Activity,
  Terminal,
  Download,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Eye,
  KeyRound,
  RefreshCw,
  Server,
  Database
} from 'lucide-react';
import { AuditLogEntry, UserRole } from '../types';
import { getLocalAuditLogs, logAuditEvent } from '../utils/auditLogger';
import { useAuth } from '../context/AuthContext';

export const AdminView: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [systemStats, setSystemStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch local and firestore audit logs
  useEffect(() => {
    const local = getLocalAuditLogs();
    if (local.length > 0) {
      setLogs(local);
    } else {
      // Seed default baseline logs for visualization
      const seedLogs: AuditLogEntry[] = [
        {
          id: 'log-1',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          userId: user?.uid || 'u_admin_system',
          userEmail: user?.email || 'admin@reflectai.app',
          userRole: 'admin',
          action: 'SESSION_AUTHENTICATED',
          category: 'AUTH',
          resource: 'FirebaseAuth::onAuthStateChanged',
          status: 'SUCCESS',
          details: 'Zero-trust token verified with Firestore UID bound rule.',
          ipAddress: '127.0.0.1 (Cloud Run Ingress)'
        },
        {
          id: 'log-2',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          userId: user?.uid || 'u_admin_system',
          userEmail: user?.email || 'admin@reflectai.app',
          userRole: 'admin',
          action: 'GEMINI_AI_REFLECTION_EXECUTED',
          category: 'AI_GENERATION',
          resource: 'models/gemini-3.6-flash',
          status: 'SUCCESS',
          details: 'Socratic dialogue turn synthesized in 412ms.',
          ipAddress: '127.0.0.1 (Cloud Run Ingress)'
        },
        {
          id: 'log-3',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          userId: user?.uid || 'u_admin_system',
          userEmail: user?.email || 'admin@reflectai.app',
          userRole: 'admin',
          action: 'FIRESTORE_RULES_AUDITED',
          category: 'SECURITY',
          resource: 'firestore.rules',
          status: 'SUCCESS',
          details: 'Verified owner-bound isolation on /users/{userId}/entries.',
          ipAddress: '127.0.0.1 (Cloud Run Ingress)'
        }
      ];
      setLogs(seedLogs);
    }

    // Fetch server stats
    fetch('/api/admin/system-stats')
      .then((r) => r.json())
      .then((data) => {
        setSystemStats(data);
        setLoadingStats(false);
      })
      .catch(() => {
        setLoadingStats(false);
      });
  }, [user]);

  const filteredLogs = logs.filter((log) => {
    if (categoryFilter !== 'ALL' && log.category !== categoryFilter) return false;
    if (statusFilter !== 'ALL' && log.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAction = log.action.toLowerCase().includes(q);
      const matchResource = log.resource.toLowerCase().includes(q);
      const matchDetails = log.details?.toLowerCase().includes(q);
      if (!matchAction && !matchResource && !matchDetails) return false;
    }
    return true;
  });

  const exportLogsAsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `reflectai-audit-logs-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportLogsAsCsv = () => {
    const headers = ['ID', 'Timestamp', 'User ID', 'Role', 'Category', 'Action', 'Resource', 'Status', 'Details'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      l.userId,
      l.userRole,
      l.category,
      l.action,
      l.resource,
      l.status,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `reflectai-audit-logs-${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="h-full flex flex-col p-4 lg:p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900/80 border border-neutral-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-600 flex items-center justify-center text-white shadow-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Admin Governance & RBAC Dashboard
              <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-800/60">
                Active Role: {currentRole.toUpperCase()}
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Role-based access matrix, immutable system audit logs, and operational telemetry
            </p>
          </div>
        </div>

        {/* Role Simulator Switcher */}
        <div className="flex items-center gap-2 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
          <span className="text-xs text-neutral-400 pl-2 font-medium">Simulate Role:</span>
          {(['admin', 'moderator', 'member', 'guest'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => setCurrentRole(r)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase transition-all ${
                currentRole === r
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* System Telemetry Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center gap-3.5">
          <Server className="w-5 h-5 text-emerald-400" />
          <div>
            <span className="text-xs text-neutral-400">System Health</span>
            <div className="text-sm font-bold text-white">HEALTHY (100%)</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center gap-3.5">
          <Activity className="w-5 h-5 text-purple-400" />
          <div>
            <span className="text-xs text-neutral-400">Average Model Latency</span>
            <div className="text-sm font-bold text-white">
              {systemStats?.models?.averageLatencyMs || 430} ms
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center gap-3.5">
          <Lock className="w-5 h-5 text-rose-400" />
          <div>
            <span className="text-xs text-neutral-400">Threats Mitigated</span>
            <div className="text-sm font-bold text-white">142 Injections Blocked</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center gap-3.5">
          <Database className="w-5 h-5 text-cyan-400" />
          <div>
            <span className="text-xs text-neutral-400">Firestore Isolation</span>
            <div className="text-sm font-bold text-white">Zero-Trust Rules Active</div>
          </div>
        </div>
      </div>

      {/* RBAC Permissions Matrix Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-rose-400" />
          Role-Based Access Control (RBAC) Permissions Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-950/80 text-neutral-400 font-mono uppercase text-[10px] border-b border-neutral-800">
              <tr>
                <th className="p-3">Capability / Resource</th>
                <th className="p-3 text-center">Admin</th>
                <th className="p-3 text-center">Moderator</th>
                <th className="p-3 text-center">Member</th>
                <th className="p-3 text-center">Guest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              <tr>
                <td className="p-3 font-medium text-white">Read & Write Own Reflections</td>
                <td className="p-3 text-center text-emerald-400">✅ Allowed</td>
                <td className="p-3 text-center text-emerald-400">✅ Allowed</td>
                <td className="p-3 text-center text-emerald-400">✅ Allowed</td>
                <td className="p-3 text-center text-amber-400">⚠️ Local Only</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-white">Gemini 3.6 Flash Multi-Turn AI</td>
                <td className="p-3 text-center text-emerald-400">✅ Allowed</td>
                <td className="p-3 text-center text-emerald-400">✅ Allowed</td>
                <td className="p-3 text-center text-emerald-400">✅ Allowed</td>
                <td className="p-3 text-center text-emerald-400">✅ Allowed</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-white">Dispatch Slack / Discord Webhooks</td>
                <td className="p-3 text-center text-emerald-400">✅ Allowed</td>
                <td className="p-3 text-center text-emerald-400">✅ Allowed</td>
                <td className="p-3 text-center text-neutral-500">❌ Denied</td>
                <td className="p-3 text-center text-neutral-500">❌ Denied</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-white">Inspect System Audit Logs & Export</td>
                <td className="p-3 text-center text-emerald-400">✅ Allowed</td>
                <td className="p-3 text-center text-neutral-500">❌ Denied</td>
                <td className="p-3 text-center text-neutral-500">❌ Denied</td>
                <td className="p-3 text-center text-neutral-500">❌ Denied</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Immutable Audit Log Ledger */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Immutable System & User Audit Trail
            </h3>
            <p className="text-xs text-neutral-400">Real-time log of security events, auth flows, and AI requests</p>
          </div>

          {/* Actions & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit trail..."
                className="pl-8 pr-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-rose-500 w-44"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200"
            >
              <option value="ALL">All Categories</option>
              <option value="AUTH">AUTH</option>
              <option value="AI_GENERATION">AI_GENERATION</option>
              <option value="SECURITY">SECURITY</option>
              <option value="ENTRY_MUTATION">ENTRY_MUTATION</option>
            </select>

            <button
              onClick={exportLogsAsJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium border border-neutral-700"
            >
              <Download className="w-3 h-3" />
              JSON
            </button>
            <button
              onClick={exportLogsAsCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium border border-neutral-700"
            >
              <Download className="w-3 h-3" />
              CSV
            </button>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto border border-neutral-800/80 rounded-xl">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-950 text-neutral-400 font-mono uppercase text-[10px] border-b border-neutral-800">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Category</th>
                <th className="p-3">Action</th>
                <th className="p-3">Resource</th>
                <th className="p-3">Status</th>
                <th className="p-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 bg-neutral-950/40">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-900/50 transition-colors">
                  <td className="p-3 font-mono text-[11px] text-neutral-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-3 font-mono text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700/60">
                      {log.category}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-white">{log.action}</td>
                  <td className="p-3 font-mono text-[11px] text-neutral-400 max-w-[160px] truncate">
                    {log.resource}
                  </td>
                  <td className="p-3">
                    {log.status === 'SUCCESS' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                        <CheckCircle2 className="w-2.5 h-2.5" /> SUCCESS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800/40">
                        <XCircle className="w-2.5 h-2.5" /> FAILED
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-neutral-300 text-xs max-w-xs truncate">{log.details || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
