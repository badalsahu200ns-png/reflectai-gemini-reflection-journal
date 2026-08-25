import { FC } from 'react';
import { ShieldCheck, ShieldAlert, Cpu, Activity, RefreshCw } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  serverStatus: {
    online: boolean;
    apiKeyConfigured: boolean;
    activeModel?: string;
  };
  onRefreshHealth: () => void;
}

export const Header: FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  serverStatus,
  onRefreshHealth
}) => {
  const tabs = [
    { id: 'threat-model', label: '5-Zone Threat Modeler' },
    { id: 'security-audit', label: 'OWASP LLM Auditor' },
    { id: 'firestore-guard', label: 'Firestore & Auth Guard' },
    { id: 'secret-hygiene', label: 'Secret Manager Hygiene' },
    { id: 'fallback-workbench', label: 'Resilient Model Ladder' },
    { id: 'test-walkthroughs', label: 'Test Walkthroughs' },
    { id: 'readme-generator', label: 'Cloud Run Deploy & README' }
  ];

  return (
    <header className="border-b border-neutral-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-semibold text-neutral-900 tracking-tight">
                  Agentic Threat Modeling & Security Studio
                </h1>
                <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                  OWASP Top 10 LLM
                </span>
              </div>
              <p className="text-xs text-neutral-500 hidden sm:block">
                Production Threat Modeling, Resilient Gemini Ladder & Cloud Run Compliance
              </p>
            </div>
          </div>

          {/* Fallback Ladder & Telemetry Status */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs text-neutral-700">
              <Cpu className="w-3.5 h-3.5 text-neutral-500" />
              <span className="text-neutral-500 font-mono">Ladder:</span>
              <span className="font-mono text-neutral-900 font-medium">3.6-flash → 3.1-lite → dynamic → 3.7-flash</span>
            </div>

            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                  serverStatus.online
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${serverStatus.online ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                {serverStatus.online ? 'Backend Live' : 'Connecting...'}
              </span>

              <button
                onClick={onRefreshHealth}
                title="Check Backend Health"
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded hover:bg-neutral-100 transition-colors"
                id="btn-refresh-health"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto scrollbar-none border-t border-neutral-100 py-1.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
