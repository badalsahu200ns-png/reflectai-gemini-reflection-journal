import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  GitBranch,
  Play,
  CheckCircle2,
  RotateCcw,
  Server,
  Cloud,
  FileCode,
  ShieldCheck,
  Cpu,
  Layers,
  Copy,
  Check,
  Terminal,
  ExternalLink
} from 'lucide-react';

interface PipelineStep {
  id: string;
  name: string;
  command: string;
  status: 'IDLE' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  durationSeconds: number;
  outputLog: string[];
}

export const CiCdView: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([
    {
      id: 'step-1',
      name: '1. TypeScript Typecheck & Linting',
      command: 'npm run lint (tsc --noEmit)',
      status: 'IDLE',
      durationSeconds: 0,
      outputLog: ['Checking all TypeScript sources across /src and /server.ts', 'Found 0 errors.']
    },
    {
      id: 'step-2',
      name: '2. Automated Unit & Security Test Specs',
      command: 'npm test -- --suite=automated,security',
      status: 'IDLE',
      durationSeconds: 0,
      outputLog: ['Executed 12 test assertions.', 'OWASP LLM01, A01, and Streak bounds verified 100%.']
    },
    {
      id: 'step-3',
      name: '3. Firestore Rules Compilation & Verification',
      command: 'firebase deploy --only firestore:rules',
      status: 'IDLE',
      durationSeconds: 0,
      outputLog: ['Parsed firestore.rules', 'Validated owner-bound request.auth.uid == userId ruleset.']
    },
    {
      id: 'step-4',
      name: '4. Production Vite & Esbuild Bundle Creation',
      command: 'npm run build',
      status: 'IDLE',
      durationSeconds: 0,
      outputLog: ['Vite compiled /dist static client SPA.', 'Esbuild bundled server.ts -> dist/server.cjs.']
    },
    {
      id: 'step-5',
      name: '5. Google Cloud Run Ingress & Secret Injection',
      command: 'gcloud run deploy reflectai --set-secrets=GEMINI_API_KEY=...',
      status: 'IDLE',
      durationSeconds: 0,
      outputLog: ['Container built on Google Cloud Build.', 'Secret Manager injected GEMINI_API_KEY securely.']
    }
  ]);

  const runPipeline = async () => {
    setIsRunning(true);
    const updated = [...pipelineSteps];

    for (let i = 0; i < updated.length; i++) {
      updated[i].status = 'RUNNING';
      setPipelineSteps([...updated]);

      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 400));
      updated[i].status = 'SUCCESS';
      updated[i].durationSeconds = Number((0.6 + Math.random() * 0.8).toFixed(1));
      setPipelineSteps([...updated]);
    }

    setIsRunning(false);
  };

  const workflowYaml = `name: Production CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  validate-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js 20.x
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run Typecheck & Linter
        run: npm run lint

      - name: Run Automated & Security Test Suite
        run: npm run test --if-present

      - name: Build Production Bundle
        run: npm run build
        env:
          NODE_ENV: production

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: \${{ secrets.GCP_SA_KEY }}

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy reflectai-journal \\
            --source . \\
            --region us-central1 \\
            --platform managed \\
            --allow-unauthenticated \\
            --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest"`;

  const copyYaml = () => {
    navigator.clipboard.writeText(workflowYaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col p-4 lg:p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900/80 border border-neutral-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl">
            <GitBranch className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Continuous Integration & Deployment (CI/CD)
              <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                GitHub Actions + Cloud Run
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Automated build lifecycle, firestore rules deployment, secret injection, and verification
            </p>
          </div>
        </div>

        <button
          onClick={runPipeline}
          disabled={isRunning}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg transition-all"
        >
          {isRunning ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin" />
              Simulating Pipeline Execution...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              Trigger CI/CD Pipeline
            </>
          )}
        </button>
      </div>

      {/* Visual Pipeline DAG Flow */}
      <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          Pipeline Stages & Deployment Lifecycle
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {pipelineSteps.map((step, idx) => (
            <div
              key={step.id}
              className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${
                step.status === 'SUCCESS'
                  ? 'bg-indigo-950/20 border-indigo-500/60'
                  : step.status === 'RUNNING'
                  ? 'bg-neutral-900 border-indigo-400 animate-pulse'
                  : 'bg-neutral-950 border-neutral-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-white truncate">{step.name}</span>
                  {step.status === 'SUCCESS' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {step.status === 'RUNNING' && <RotateCcw className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />}
                </div>
                <div className="text-[10px] font-mono text-neutral-400 truncate">{step.command}</div>
              </div>

              <div className="text-[10px] text-neutral-500 font-mono flex items-center justify-between border-t border-neutral-800/80 pt-1.5">
                <span>Stage {idx + 1}</span>
                <span>{step.durationSeconds > 0 ? `${step.durationSeconds}s` : 'Queued'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GitHub Actions YAML Preview */}
      <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">.github/workflows/deploy.yml</h3>
          </div>
          <button
            onClick={copyYaml}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium border border-neutral-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Workflow' : 'Copy Workflow YAML'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 text-[11px] font-mono text-neutral-300 overflow-x-auto leading-relaxed">
          {workflowYaml}
        </pre>
      </div>
    </div>
  );
};
