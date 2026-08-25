import { useState, FC } from 'react';
import {
  ListChecks,
  CheckCircle2,
  Circle,
  Download,
  Filter,
  Play,
  Layers,
  ChevronDown,
  ChevronUp,
  FileCheck
} from 'lucide-react';
import { TEST_WALKTHROUGHS } from '../utils/testCases';
import { TestCaseItem } from '../types';

export const TestWalkthroughs: FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [completedTestIds, setCompletedTestIds] = useState<Set<string>>(new Set());
  const [expandedTestId, setExpandedTestId] = useState<string | null>(TEST_WALKTHROUGHS[0].id);

  const toggleTestCompleted = (id: string) => {
    setCompletedTestIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredTests = TEST_WALKTHROUGHS.filter(
    tc => selectedCategory === 'ALL' || tc.category === selectedCategory
  );

  const exportTestPlanMarkdown = () => {
    const md = `# Functional Stability & Quality Assurance Test Suite
Generated: ${new Date().toISOString()}
Total Test Cases: ${TEST_WALKTHROUGHS.length}
Verified: ${completedTestIds.size} / ${TEST_WALKTHROUGHS.length}

${TEST_WALKTHROUGHS.map(
  tc => `## [${tc.id}] ${tc.testCaseName}
- **Module**: ${tc.module}
- **Category**: ${tc.category}
- **Description**: ${tc.description}
- **Preconditions**: ${tc.preconditions}
- **Execution Steps**:
${tc.testSteps.map((s, idx) => `  ${idx + 1}. ${s}`).join('\n')}
- **Expected Result**: ${tc.expectedResult}
- **Status**: ${completedTestIds.has(tc.id) ? 'PASS / VERIFIED' : 'PENDING'}
`
).join('\n---\n\n')}
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-walkthrough-suite.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-neutral-800" />
              Functional Stability & QA Test Walkthrough Catalog
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Comprehensive test cases covering all user interactions, fallback ladder failover, payload hygiene, and Cloud Run deployments.
            </p>
          </div>

          <button
            onClick={exportTestPlanMarkdown}
            className="inline-flex items-center px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-medium shadow-xs transition-all"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export Test Plan (Markdown)
          </button>
        </div>

        {/* Progress bar */}
        <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs text-neutral-500 font-medium">Test Verification Progress</div>
            <div className="text-base font-bold font-mono text-neutral-900 mt-0.5">
              {completedTestIds.size} of {TEST_WALKTHROUGHS.length} Test Cases Verified
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-neutral-500">Filter Category:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white font-medium text-neutral-800"
            >
              <option value="ALL">All Categories</option>
              <option value="THREAT_MODELING">Threat Modeling</option>
              <option value="SECURITY_REVIEW">Security Review</option>
              <option value="FALLBACK_LADDER">Fallback Ladder</option>
              <option value="PAYLOAD_HYGIENE">Payload Hygiene</option>
              <option value="FIRESTORE_AUTH">Firestore & Auth</option>
              <option value="DEPLOYMENT">Deployment</option>
            </select>
          </div>
        </div>
      </div>

      {/* Test Cases List */}
      <div className="space-y-3">
        {filteredTests.map((tc) => {
          const isCompleted = completedTestIds.has(tc.id);
          const isExpanded = expandedTestId === tc.id;

          return (
            <div
              key={tc.id}
              className={`bg-white rounded-xl border transition-all shadow-xs ${
                isCompleted ? 'border-emerald-300 bg-emerald-50/20' : 'border-neutral-200'
              }`}
            >
              <div className="p-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTestCompleted(tc.id)}
                    className="mt-0.5 text-neutral-400 hover:text-emerald-600 transition-colors"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-5 h-5 text-neutral-400" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
                        {tc.id}
                      </span>
                      <span className="text-xs font-semibold text-neutral-500 uppercase">
                        {tc.module}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-neutral-900 mt-1">{tc.testCaseName}</h3>
                    <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">{tc.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedTestId(isExpanded ? null : tc.id)}
                  className="p-1 text-neutral-400 hover:text-neutral-700 rounded hover:bg-neutral-100"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-neutral-100 text-xs space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                      <div className="font-semibold text-neutral-700 mb-1">Preconditions:</div>
                      <div className="text-neutral-600">{tc.preconditions}</div>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
                      <div className="font-semibold text-emerald-900 mb-1">Expected Outcome:</div>
                      <div className="text-emerald-800">{tc.expectedResult}</div>
                    </div>
                  </div>

                  <div>
                    <div className="font-semibold text-neutral-800 mb-2">Step-by-Step Test Procedure:</div>
                    <ol className="list-decimal pl-5 space-y-1.5 text-neutral-700 leading-relaxed">
                      {tc.testSteps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => toggleTestCompleted(tc.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-neutral-900 text-white hover:bg-neutral-800'
                      }`}
                    >
                      {isCompleted ? 'Mark as Unverified' : 'Mark Test as Passed'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
