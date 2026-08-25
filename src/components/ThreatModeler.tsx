import { useState, FC } from 'react';
import {
  ShieldAlert,
  BrainCircuit,
  Terminal,
  Database,
  Network,
  Download,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Filter,
  Check,
  Cpu,
  Layers
} from 'lucide-react';
import { ThreatItem, ThreatModelReport, ThreatZone, SeverityLevel } from '../types';
import { THREAT_ZONES, stripUndefinedDeep } from '../utils/security';

const PRESET_ARCHITECTURES = [
  {
    name: 'Full-Stack Agent with Tool Calling & Firestore',
    desc: 'Express.js backend with Vite frontend, user chat prompts, Gemini model with function calling tools (database query, weather API, file system access), session memory persisted in Firestore, and external payment webhooks.'
  },
  {
    name: 'RAG Knowledge Assistant with Vector Embeddings',
    desc: 'Multimodal document ingestion (PDFs/Images), Chunking & Vector DB embedding pipeline, Gemini retrieval reasoning, user query rewriting, and owner-isolated context memory.'
  },
  {
    name: 'Autonomous Task Execution & Shell Agent',
    desc: 'System instruction directing autonomous goal decomposition, dynamic Python/Bash execution sandbox, internet search tool, and credentials retrieved from Cloud Secret Manager.'
  },
  {
    name: 'Customer Support Bot with Workspace OAuth Integration',
    desc: 'Public chat widget ingesting untrusted customer support tickets, Google Workspace OAuth integration (Gmail / Google Sheets), automated CRM database updates, and Gemini response generation.'
  }
];

export const ThreatModeler: FC = () => {
  const [systemName, setSystemName] = useState('Production Agentic Workflow');
  const [architectureDescription, setArchitectureDescription] = useState(PRESET_ARCHITECTURES[0].desc);
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('ALL');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>('ALL');
  const [expandedThreatId, setExpandedThreatId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [report, setReport] = useState<ThreatModelReport | null>(null);
  const [threats, setThreats] = useState<ThreatItem[]>([]);

  // Default initial mock-free threat summary table
  const handleGenerateThreatModel = async (forceSimulatedError = false) => {
    setIsLoading(true);
    setErrorBanner(null);

    try {
      const sanitizedPayload = stripUndefinedDeep({
        systemName: systemName.trim() || 'Agentic System',
        architectureDescription: architectureDescription.trim(),
        forceSimulatedError
      });

      const res = await fetch('/api/threat-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedPayload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Server returned ${res.status}`);
      }

      const data: ThreatModelReport = await res.json();
      setReport(data);
      setThreats(data.threatSummaryTable || []);
    } catch (err: any) {
      console.error('Threat model error:', err);
      setErrorBanner(err.message || 'Failed to generate threat model. Check Gemini API key configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateThreatStatus = (id: string, newStatus: 'MITIGATED' | 'IN_PROGRESS' | 'UNRESOLVED') => {
    setThreats(prev =>
      prev.map(item => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  // Recalculate risk score based on active mitigations
  const calculateLiveRiskScore = () => {
    if (threats.length === 0) return 0;
    const unresolvedWeight = threats.reduce((acc, t) => {
      if (t.status === 'MITIGATED') return acc;
      const factor = t.status === 'IN_PROGRESS' ? 0.5 : 1.0;
      let score = 10;
      if (t.severity === 'CRITICAL') score = 25;
      else if (t.severity === 'HIGH') score = 18;
      else if (t.severity === 'MEDIUM') score = 10;
      else score = 4;
      return acc + score * factor;
    }, 0);
    return Math.min(100, Math.round((unresolvedWeight / (threats.length * 20)) * 100));
  };

  const currentRiskScore = calculateLiveRiskScore();

  const filteredThreats = threats.filter(t => {
    const matchesZone = selectedZoneFilter === 'ALL' || t.threatZone === selectedZoneFilter;
    const matchesSeverity = selectedSeverityFilter === 'ALL' || t.severity === selectedSeverityFilter;
    return matchesZone && matchesSeverity;
  });

  const getZoneIcon = (zone: ThreatZone) => {
    switch (zone) {
      case 'Input Surfaces':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      case 'Planning & Reasoning':
        return <BrainCircuit className="w-4 h-4 text-purple-600" />;
      case 'Tool Execution':
        return <Terminal className="w-4 h-4 text-amber-600" />;
      case 'Memory & State':
        return <Database className="w-4 h-4 text-blue-600" />;
      case 'Inter-System Communication':
        return <Network className="w-4 h-4 text-teal-600" />;
    }
  };

  const getSeverityBadge = (sev: SeverityLevel) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">LOW</span>;
    }
  };

  const exportReportMarkdown = () => {
    if (!report && threats.length === 0) return;
    const mdContent = `# Agentic Threat Model Report: ${systemName}
Generated: ${report?.timestamp || new Date().toISOString()}
Model Fallback Used: ${report?.modelUsed || 'gemini-3.6-flash'}
Live Risk Score: ${currentRiskScore}/100

## 1. Executive Summary
${report?.executiveSummary || 'Structured 5-Zone Threat Analysis and Countermeasure Mapping.'}

## 2. Threat Summary Table (5 Threat Zones)
| ID | Zone | Threat | Severity | OWASP Mapping | Status | Countermeasure |
|---|---|---|---|---|---|---|
${threats
  .map(
    t =>
      `| ${t.id} | ${t.threatZone} | ${t.threatName} | ${t.severity} | ${t.owaspMapping} | ${t.status} | ${t.countermeasure} |`
  )
  .join('\n')}

## 3. Detailed Attack Vectors & Concrete Remediations
${threats
  .map(
    t => `### [${t.id}] ${t.threatName} (${t.severity})
- **Threat Zone**: ${t.threatZone}
- **OWASP Reference**: ${t.owaspMapping}
- **Attack Scenario**: ${t.attackVector}
- **Countermeasure**: ${t.countermeasure}
- **Remediation Code**:
\`\`\`
${t.implementationCodeSnippet || '// Apply strict context-bound validation and schema checking'}
\`\`\`
`
  )
  .join('\n\n')}
`;

    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `threat-model-${systemName.toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Overview & Architecture Configuration */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-100 pb-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-neutral-800" />
              Agentic Threat Modeling Engine
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Structured scenario-driven threat modeling across all 5 Agentic Threat Zones with OWASP LLM mapping.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleGenerateThreatModel(false)}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-medium shadow-xs transition-all disabled:opacity-50"
              id="btn-generate-threat-model"
            >
              {isLoading ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Analyzing 5 Zones...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 mr-2 fill-current" />
                  Generate 5-Zone Threat Model
                </>
              )}
            </button>

            {threats.length > 0 && (
              <button
                onClick={exportReportMarkdown}
                className="inline-flex items-center px-3 py-2 bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 rounded-lg text-xs font-medium transition-all"
                id="btn-export-threat-model"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Export Markdown
              </button>
            )}
          </div>
        </div>

        {/* Preset Templates */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-neutral-700 mb-1.5">
            Architecture Presets:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {PRESET_ARCHITECTURES.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSystemName(preset.name);
                  setArchitectureDescription(preset.desc);
                }}
                className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                  architectureDescription === preset.desc
                    ? 'border-neutral-900 bg-neutral-50 text-neutral-900 font-medium'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                }`}
              >
                <div className="font-semibold truncate">{preset.name}</div>
                <div className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5">{preset.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              System / Workload Name
            </label>
            <input
              type="text"
              value={systemName}
              onChange={e => setSystemName(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
              placeholder="e.g. Agentic RAG Pipeline"
              id="input-system-name"
            />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Architecture Description & Tool Calling Surfaces
            </label>
            <textarea
              rows={2}
              value={architectureDescription}
              onChange={e => setArchitectureDescription(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
              placeholder="Describe user entry points, tools, database integration, and external APIs..."
              id="input-architecture-desc"
            />
          </div>
        </div>

        {/* Error Banner with Retry Save Buffer */}
        {errorBanner && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorBanner}</span>
            </div>
            <button
              onClick={() => handleGenerateThreatModel(false)}
              className="px-2.5 py-1 bg-red-600 text-white rounded text-[11px] font-medium hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* 5 Threat Zones Architecture Visual Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {THREAT_ZONES.map((zoneItem, idx) => {
          const zoneThreats = threats.filter(t => t.threatZone === zoneItem.zone);
          const hasCritical = zoneThreats.some(t => t.severity === 'CRITICAL' && t.status !== 'MITIGATED');
          const isSelected = selectedZoneFilter === zoneItem.zone;

          return (
            <div
              key={idx}
              onClick={() => setSelectedZoneFilter(isSelected ? 'ALL' : zoneItem.zone)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-neutral-900 bg-neutral-900 text-white shadow-md'
                  : hasCritical
                  ? 'border-red-300 bg-red-50/50 hover:border-red-400'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-semibold text-xs">
                  <span className={isSelected ? 'text-white' : ''}>{getZoneIcon(zoneItem.zone)}</span>
                  <span>{zoneItem.zone}</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                    isSelected
                      ? 'bg-neutral-800 text-neutral-200'
                      : zoneThreats.length > 0
                      ? 'bg-neutral-100 text-neutral-800'
                      : 'bg-neutral-50 text-neutral-400'
                  }`}
                >
                  {zoneThreats.length} threats
                </span>
              </div>
              <p className={`text-[11px] line-clamp-2 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                {zoneItem.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Summary Metrics & Live Risk Score Bar */}
      {threats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="text-xs text-neutral-500 font-medium">System Risk Score</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-bold font-mono ${currentRiskScore > 50 ? 'text-red-600' : currentRiskScore > 25 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {currentRiskScore}/100
              </span>
              <span className="text-xs text-neutral-400">
                {currentRiskScore > 50 ? 'High Exposure' : currentRiskScore > 25 ? 'Moderate' : 'Hardened'}
              </span>
            </div>
            <div className="w-full bg-neutral-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  currentRiskScore > 50 ? 'bg-red-500' : currentRiskScore > 25 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${currentRiskScore}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="text-xs text-neutral-500 font-medium">Mitigation Progress</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-neutral-900">
                {threats.filter(t => t.status === 'MITIGATED').length} / {threats.length}
              </span>
              <span className="text-xs text-neutral-400">Mitigated</span>
            </div>
            <div className="text-[11px] text-neutral-500 mt-2">
              {threats.filter(t => t.status === 'IN_PROGRESS').length} in progress, {threats.filter(t => t.status === 'UNRESOLVED').length} unresolved
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="text-xs text-neutral-500 font-medium">Severity Distribution</div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-xs font-mono px-2 py-0.5 bg-red-100 text-red-800 rounded font-bold">
                {threats.filter(t => t.severity === 'CRITICAL').length} Crit
              </span>
              <span className="text-xs font-mono px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">
                {threats.filter(t => t.severity === 'HIGH').length} High
              </span>
              <span className="text-xs font-mono px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded">
                {threats.filter(t => t.severity === 'MEDIUM').length} Med
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="text-xs text-neutral-500 font-medium">AI Fallback Telemetry</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-900 font-mono font-medium">
              <Cpu className="w-3.5 h-3.5 text-emerald-600" />
              <span>{report?.modelUsed || 'gemini-3.6-flash'}</span>
            </div>
            <div className="text-[11px] text-neutral-500 mt-2">
              Latency: {report?.fallbackTelemetry?.latencyMs || 420}ms | Zero-Crash Sanitation Active
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Threat Summary Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">
              Mandatory Threat Summary Table (5 Threat Zones Mapping)
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Mapped against OWASP Top 10 for LLM Applications and OWASP Web Standards.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-lg px-2 py-1 text-xs">
              <Filter className="w-3 h-3 text-neutral-400" />
              <span className="text-neutral-500">Zone:</span>
              <select
                value={selectedZoneFilter}
                onChange={e => setSelectedZoneFilter(e.target.value)}
                className="bg-transparent font-medium text-neutral-800 focus:outline-none text-xs"
              >
                <option value="ALL">All Zones</option>
                <option value="Input Surfaces">Input Surfaces</option>
                <option value="Planning & Reasoning">Planning & Reasoning</option>
                <option value="Tool Execution">Tool Execution</option>
                <option value="Memory & State">Memory & State</option>
                <option value="Inter-System Communication">Inter-System Comm</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-lg px-2 py-1 text-xs">
              <span className="text-neutral-500">Severity:</span>
              <select
                value={selectedSeverityFilter}
                onChange={e => setSelectedSeverityFilter(e.target.value)}
                className="bg-transparent font-medium text-neutral-800 focus:outline-none text-xs"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>
        </div>

        {threats.length === 0 ? (
          <div className="p-12 text-center">
            <Layers className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-neutral-800">No Threat Model Generated Yet</h4>
            <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1">
              Select an architecture preset above and click &quot;Generate 5-Zone Threat Model&quot; to run automated threat mapping.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-100/75 text-neutral-600 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-4 w-12">ID</th>
                  <th className="py-2.5 px-4">Threat Zone</th>
                  <th className="py-2.5 px-4">Threat Name & OWASP Mapping</th>
                  <th className="py-2.5 px-4 w-28">Severity</th>
                  <th className="py-2.5 px-4">Countermeasure</th>
                  <th className="py-2.5 px-4 w-36">Status</th>
                  <th className="py-2.5 px-4 w-16">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredThreats.map((threat) => {
                  const isExpanded = expandedThreatId === threat.id;
                  return (
                    <tr key={threat.id} className="hover:bg-neutral-50/75 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-neutral-600 align-top">
                        {threat.id}
                      </td>
                      <td className="py-3 px-4 align-top">
                        <div className="flex items-center gap-1.5 font-medium text-neutral-800">
                          {getZoneIcon(threat.threatZone)}
                          <span className="truncate max-w-[130px]">{threat.threatZone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 align-top">
                        <div className="font-semibold text-neutral-900">{threat.threatName}</div>
                        <div className="text-[11px] text-neutral-500 font-mono mt-0.5">{threat.owaspMapping}</div>
                      </td>
                      <td className="py-3 px-4 align-top">
                        {getSeverityBadge(threat.severity)}
                      </td>
                      <td className="py-3 px-4 align-top text-neutral-700">
                        <div className="line-clamp-2">{threat.countermeasure}</div>
                      </td>
                      <td className="py-3 px-4 align-top">
                        <select
                          value={threat.status}
                          onChange={e => handleUpdateThreatStatus(threat.id, e.target.value as any)}
                          className={`text-xs px-2 py-1 rounded font-medium border focus:outline-none ${
                            threat.status === 'MITIGATED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : threat.status === 'IN_PROGRESS'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-red-50 text-red-800 border-red-300'
                          }`}
                        >
                          <option value="UNRESOLVED">Unresolved</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="MITIGATED">Mitigated</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 align-top text-center">
                        <button
                          onClick={() => setExpandedThreatId(isExpanded ? null : threat.id)}
                          className="p-1 rounded text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Expanded Threat Detail Modal / Drawer */}
        {expandedThreatId && (
          <div className="p-5 border-t border-neutral-200 bg-neutral-50">
            {(() => {
              const current = threats.find(t => t.id === expandedThreatId);
              if (!current) return null;
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-2">
                      <span>Attack Vector & Concrete Remediation:</span>
                      <span className="font-mono text-neutral-900">{current.threatName}</span>
                    </h4>
                    <button
                      onClick={() => setExpandedThreatId(null)}
                      className="text-xs text-neutral-500 hover:text-neutral-800"
                    >
                      Close
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-white rounded-lg border border-red-200">
                      <div className="font-semibold text-red-900 mb-1 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                        Exploitation Scenario (Attack Vector)
                      </div>
                      <p className="text-neutral-700 leading-relaxed">{current.attackVector}</p>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-emerald-200">
                      <div className="font-semibold text-emerald-900 mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Countermeasure Implementation
                      </div>
                      <p className="text-neutral-700 leading-relaxed">{current.countermeasure}</p>
                    </div>
                  </div>

                  {current.implementationCodeSnippet && (
                    <div className="mt-3">
                      <div className="text-[11px] font-mono text-neutral-500 mb-1">Recommended Remediation Snippet:</div>
                      <pre className="p-3 bg-neutral-900 text-neutral-100 rounded-lg text-xs font-mono overflow-x-auto">
                        {current.implementationCodeSnippet}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
