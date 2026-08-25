import { useState, FC } from 'react';
import {
  Cpu,
  Zap,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
  Activity,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { FallbackTelemetry } from '../types';

export const FallbackWorkbench: FC = () => {
  const [testPrompt, setTestPrompt] = useState(
    'Demonstrate automated error recovery and output an agent security recommendation.'
  );
  const [forceSimulatedPrimaryError, setForceSimulatedPrimaryError] = useState(false);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<FallbackTelemetry | null>(null);
  const [errorLogs, setErrorLogs] = useState<string[]>([]);

  const ladderSteps = [
    {
      tier: '1. Primary Model',
      model: 'gemini-3.6-flash',
      role: 'Default balanced intelligence & latency',
      status: forceSimulatedPrimaryError ? 'Simulated 503 Overload' : 'Active'
    },
    {
      tier: '2. High-Availability Fallback',
      model: 'gemini-3.1-flash-lite',
      role: 'Ultra-low latency instant failover',
      status: forceSimulatedPrimaryError ? 'Takes Over Automatically' : 'Standby'
    },
    {
      tier: '3. Dynamic Stable Alias',
      model: 'gemini-flash-latest',
      role: 'Platform-managed continuous alias',
      status: 'Standby'
    },
    {
      tier: '4. Deep Reasoning Fallback',
      model: 'gemini-3.7-flash',
      role: 'Complex STEM & deep reasoning',
      status: 'Standby'
    }
  ];

  const handleRunFallbackTest = async () => {
    setIsRunningTest(true);
    setErrorLogs([]);
    setTestOutput(null);
    setTelemetry(null);

    try {
      const res = await fetch('/api/threat-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemName: 'Fallback Resilience Verification',
          architectureDescription: testPrompt,
          forceSimulatedError: forceSimulatedPrimaryError
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      setTestOutput(data.executiveSummary || JSON.stringify(data, null, 2));
      setTelemetry(data.fallbackTelemetry || null);
      if (data.fallbackTelemetry?.recoveredFromErrors) {
        setErrorLogs(data.fallbackTelemetry.recoveredFromErrors);
      }
    } catch (err: any) {
      setErrorLogs([`Execution error: ${err.message}`]);
    } finally {
      setIsRunningTest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-neutral-800" />
              Resilient Gemini Model Fallback Ladder & Error Recovery Matrix
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Automated 4-tier ladder failover mitigating HTTP 503 Unavailable, 429 Rate Limits, 404, and 500 Internal Errors.
            </p>
          </div>

          <button
            onClick={handleRunFallbackTest}
            disabled={isRunningTest}
            className="inline-flex items-center px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-medium shadow-xs transition-all disabled:opacity-50"
            id="btn-run-fallback-test"
          >
            {isRunningTest ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 mr-2 animate-spin" />
                Testing Fallback Ladder...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 mr-2 fill-current" />
                Execute Resilient Generation Test
              </>
            )}
          </button>
        </div>

        {/* Simulated Failure Toggle */}
        <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${forceSimulatedPrimaryError ? 'text-red-600' : 'text-neutral-400'}`} />
            <div>
              <div className="text-xs font-semibold text-neutral-800">
                Simulate Primary Model Failure (503 UNAVAILABLE)
              </div>
              <div className="text-[11px] text-neutral-500">
                Tests automatic live failover to tier 2 (`gemini-3.1-flash-lite`) without crashing or bubbling errors to UI.
              </div>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={forceSimulatedPrimaryError}
              onChange={e => setForceSimulatedPrimaryError(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>
      </div>

      {/* Visual Fallback Ladder Flow */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {ladderSteps.map((step, idx) => {
          const isPrimary = idx === 0;
          const isSuccess = telemetry?.successfulModel === step.model;
          const isAttempted = telemetry?.attemptedModels?.includes(step.model);

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                isSuccess
                  ? 'border-emerald-500 bg-emerald-50/60 shadow-sm'
                  : isAttempted && !isSuccess
                  ? 'border-red-300 bg-red-50/40'
                  : 'border-neutral-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-mono font-bold text-neutral-500">
                  {step.tier}
                </span>
                {isSuccess && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Responded
                  </span>
                )}
                {isAttempted && !isSuccess && (
                  <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                    Failed & Escalated
                  </span>
                )}
              </div>

              <div className="text-sm font-mono font-bold text-neutral-900 mb-1">
                {step.model}
              </div>
              <div className="text-xs text-neutral-600 leading-relaxed mb-2">
                {step.role}
              </div>

              <div className="text-[11px] font-mono text-neutral-500 border-t border-neutral-100 pt-2 flex items-center justify-between">
                <span>Status:</span>
                <span className={forceSimulatedPrimaryError && isPrimary ? 'text-red-600 font-bold' : ''}>
                  {step.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Execution Telemetry & Error Recovery Trace Logs */}
      {telemetry && (
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            Execution Telemetry & Ladder Recovery Matrix
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs">
              <div className="text-neutral-500">Successful Model</div>
              <div className="font-mono font-bold text-neutral-900 mt-1">{telemetry.successfulModel}</div>
            </div>
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs">
              <div className="text-neutral-500">Ladder Progression</div>
              <div className="font-mono text-neutral-900 mt-1">
                {telemetry.attemptedModels.join(' → ')}
              </div>
            </div>
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs">
              <div className="text-neutral-500">Latency</div>
              <div className="font-mono font-bold text-emerald-700 mt-1">{telemetry.latencyMs} ms</div>
            </div>
          </div>

          {errorLogs.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-neutral-700 mb-1">
                Caught & Recovered Ladder Exceptions:
              </div>
              <div className="space-y-1">
                {errorLogs.map((log, i) => (
                  <div key={i} className="p-2 bg-amber-50 border border-amber-200 rounded text-xs font-mono text-amber-900">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {testOutput && (
            <div className="pt-2">
              <div className="text-xs font-semibold text-neutral-700 mb-1">Generated Output Result:</div>
              <div className="p-3 bg-neutral-950 text-neutral-100 rounded-lg text-xs font-mono leading-relaxed">
                {testOutput}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
