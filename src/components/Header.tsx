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
    <header className="border-b border-[#262626] bg-[#000000] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#111111] border border-[#76B900]/40 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-6 h-6 text-[#76B900]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-semibold text-[#F5F5F5] tracking-tight">
                  Reflect<span className="text-[#76B900]">AI</span> Security & Threat Modeler Studio
                </h1>
                <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-[#76B900]/15 text-[#76B900] border border-[#76B900]/30 font-medium">
                  OWASP Top 10 LLM
                </span>
              </div>
              <p className="text-xs text-[#BDBDBD] hidden sm:block">
                Production Threat Modeling, Resilient Gemini Ladder & Cloud Run Compliance
              </p>
            </div>
          </div>

          {/* Fallback Ladder & Telemetry Status */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2 bg-[#111111] border border-[#262626] rounded-lg px-3 py-1.5 text-xs text-[#F5F5F5]">
              <Cpu className="w-3.5 h-3.5 text-[#76B900]" />
              <span className="text-[#BDBDBD] font-mono">Ladder:</span>
              <span className="font-mono text-[#FFD600] font-medium">3.6-flash → 3.1-lite → dynamic → 3.7-flash</span>
            </div>

            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                  serverStatus.online
                    ? 'bg-[#76B900]/15 text-[#76B900] border-[#76B900]/40'
                    : 'bg-amber-950/40 text-[#FFD600] border-amber-800/50'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${serverStatus.online ? 'bg-[#76B900] animate-pulse' : 'bg-[#FFD600]'}`} />
                {serverStatus.online ? 'Backend Live' : 'Connecting...'}
              </span>

              <button
                onClick={onRefreshHealth}
                title="Check Backend Health"
                className="p-1.5 text-[#BDBDBD] hover:text-[#76B900] rounded hover:bg-[#111111] transition-colors"
                id="btn-refresh-health"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto scrollbar-none border-t border-[#262626] py-1.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#76B900] text-black font-bold shadow-xs'
                    : 'text-[#BDBDBD] hover:text-[#F5F5F5] hover:bg-[#111111]'
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
