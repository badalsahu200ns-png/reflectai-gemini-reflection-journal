import { useState, FC, useEffect } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  Terminal,
  Cloud,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { CloudRunDeployConfig } from '../types';

export const ReadmeGenerator: FC = () => {
  const [config, setConfig] = useState<CloudRunDeployConfig>({
    projectName: 'my-gcp-ai-project',
    region: 'us-central1',
    serviceName: 'agentic-threat-modeling-studio',
    secretName: 'GEMINI_API_KEY',
    campaignLabel: 'dev-tutorial=cloud-run-ai-challenge',
    firestoreMode: 'native'
  });

  const [copied, setCopied] = useState(false);
  const [readmeContent, setReadmeContent] = useState('');

  const generateMarkdown = () => {
    return `# ${config.serviceName
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')}

> **Production Deployment Guide** | Google Cloud Run, Secret Manager, Cloud Firestore, and Resilient Gemini Fallback Ladder.

---

## 1. Prerequisites & API Activation

Install and configure the Google Cloud SDK (\`gcloud\` CLI):

\`\`\`bash
# 1. Authenticate with your Google Cloud account
gcloud auth login

# 2. Select your target GCP project
gcloud config set project ${config.projectName}

# 3. Enable required Google Cloud APIs
gcloud services enable \\
  run.googleapis.com \\
  secretmanager.googleapis.com \\
  firestore.googleapis.com \\
  cloudbuild.googleapis.com
\`\`\`

---

## 2. Secret Manager Provisioning & IAM Binding

Secure your API keys with zero hardcoding:

\`\`\`bash
# Create the secret in Secret Manager
gcloud secrets create ${config.secretName} --replication-policy="automatic"

# Populate the secret value from stdin (prevents terminal history leakage)
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add ${config.secretName} --data-file=-

# Retrieve your GCP Project Number
PROJECT_NUMBER=$(gcloud projects describe ${config.projectName} --format="value(projectNumber)")

# Grant the Cloud Run default runtime service account access to read the secret
gcloud secrets add-iam-policy-binding ${config.secretName} \\
  --member="serviceAccount:\${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \\
  --role="roles/secretmanager.secretAccessor"
\`\`\`

---

## 3. Cloud Firestore & Owner-Bound Security Rules

Provision Firestore in Native Mode:

\`\`\`bash
gcloud firestore databases create --location=${config.region} --type=firestore-native
\`\`\`

Deploy owner-bound security rules to \`firestore.rules\`:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Owner-bound personal interactions isolation
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // User profiles
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Default deny for all other paths
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
\`\`\`

Deploy rules:
\`\`\`bash
firebase deploy --only firestore:rules
\`\`\`

---

## 4. Google Cloud Run Deployment

Deploy the container to Cloud Run with Secret Manager secret injection and production environment:

\`\`\`bash
gcloud run deploy ${config.serviceName} \\
  --source . \\
  --region=${config.region} \\
  --platform=managed \\
  --allow-unauthenticated \\
  --set-secrets="${config.secretName}=${config.secretName}:latest" \\
  --set-env-vars="NODE_ENV=production"
\`\`\`

---

## 5. Mandatory Campaign Verification Binding

Apply the mandatory challenge verification label to register your deployed service:

\`\`\`bash
gcloud run services update ${config.serviceName} \\
  --update-labels=${config.campaignLabel} \\
  --region=${config.region}
\`\`\`

Verify label attachment:
\`\`\`bash
gcloud run services describe ${config.serviceName} \\
  --region=${config.region} \\
  --format="value(metadata.labels)"
\`\`\`

---

## 6. Architecture & Resilient Fallback Ladder

The backend utilizes an automated 4-tier model fallback ladder:
- **Primary**: \`gemini-3.6-flash\` (High throughput, balanced reasoning)
- **Fallback 1**: \`gemini-3.1-flash-lite\` (Ultra-low latency instant recovery)
- **Fallback 2**: \`gemini-flash-latest\` (Dynamic platform alias)
- **Fallback 3**: \`gemini-3.7-flash\` (Deep reasoning & code analysis)

All incoming payloads are strictly sanitized using zero-crash undefined-stripping and context-bound authorization before processing.
`;
  };

  useEffect(() => {
    setReadmeContent(generateMarkdown());
  }, [config]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(readmeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReadme = () => {
    const blob = new Blob([readmeContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-neutral-800" />
              Cloud Run Deployment & README.md Generator
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Production deployment documentation generator with Secret Manager bindings, Firestore owner isolation, and campaign verification labels.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copied ? 'Copied Markdown' : 'Copy README.md'}
            </button>

            <button
              onClick={downloadReadme}
              className="inline-flex items-center px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-medium shadow-xs transition-all"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download README.md
            </button>
          </div>
        </div>

        {/* Config Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-neutral-100">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">GCP Project ID:</label>
            <input
              type="text"
              value={config.projectName}
              onChange={e => setConfig({ ...config, projectName: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Cloud Run Service Name:</label>
            <input
              type="text"
              value={config.serviceName}
              onChange={e => setConfig({ ...config, serviceName: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Cloud Region:</label>
            <input
              type="text"
              value={config.region}
              onChange={e => setConfig({ ...config, region: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Secret Manager Key Name:</label>
            <input
              type="text"
              value={config.secretName}
              onChange={e => setConfig({ ...config, secretName: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-neutral-700 mb-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-neutral-500" />
              Mandatory Campaign Verification Label:
            </label>
            <input
              type="text"
              value={config.campaignLabel}
              onChange={e => setConfig({ ...config, campaignLabel: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 font-mono bg-emerald-50/50 text-emerald-950 font-bold"
            />
          </div>
        </div>
      </div>

      {/* Markdown Preview */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-neutral-800" />
            Generated README.md Live Preview
          </h3>
          <span className="text-xs font-mono text-neutral-500">Copy-pasteable production documentation</span>
        </div>

        <pre className="p-4 bg-neutral-950 text-neutral-100 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {readmeContent}
        </pre>
      </div>
    </div>
  );
};
