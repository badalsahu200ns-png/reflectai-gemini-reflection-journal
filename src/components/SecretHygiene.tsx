import { useState, FC } from 'react';
import {
  Key,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  Terminal,
  FileCode,
  Lock,
  Zap,
  Server
} from 'lucide-react';
import { scanForExposedSecrets } from '../utils/security';

export const SecretHygiene: FC = () => {
  const [projectId, setProjectId] = useState('my-gcp-project-id');
  const [secretName, setSecretName] = useState('GEMINI_API_KEY');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Scanner state
  const [scannerInput, setScannerInput] = useState(`// Configuration File
export const config = {
  appName: "ThreatModeler",
  environment: "production",
  // WARNING: Example of insecure hardcoding
  geminiApiKey: "AIzaSyD9871234981273918239128391238",
  authHeader: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
};`);
  const [scanFindings, setScanFindings] = useState(() => scanForExposedSecrets(scannerInput));

  const handleScanSecrets = () => {
    setScanFindings(scanForExposedSecrets(scannerInput));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const gcloudSecretCommands = `# 1. Create the Secret in Google Cloud Secret Manager
gcloud secrets create ${secretName} --replication-policy="automatic"

# 2. Add the API Key payload securely from stdin (never committed to git)
echo -n "YOUR_API_KEY_HERE" | gcloud secrets versions add ${secretName} --data-file=-

# 3. Retrieve your GCP Project Number
PROJECT_NUMBER=$(gcloud projects describe ${projectId} --format="value(projectNumber)")

# 4. Grant the default Cloud Run runtime service account permission to read the secret
gcloud secrets add-iam-policy-binding ${secretName} \\
  --member="serviceAccount:\${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \\
  --role="roles/secretmanager.secretAccessor"`;

  const nodeSecretSnippet = `// Node.js / TypeScript Dynamic Secret Access via @google-cloud/secret-manager
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

let cachedSecret: string | null = null;

export async function getSecret(secretName = '${secretName}'): Promise<string> {
  // First prefer container runtime environment variable injection
  if (process.env[secretName]) {
    return process.env[secretName]!;
  }

  if (cachedSecret) return cachedSecret;

  const client = new SecretManagerServiceClient();
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || '${projectId}';
  const name = \`projects/\${projectId}/secrets/\${secretName}/versions/latest\`;

  const [version] = await client.accessSecretVersion({ name });
  const payload = version.payload?.data?.toString();
  
  if (!payload) {
    throw new Error(\`Secret \${secretName} payload is empty\`);
  }

  cachedSecret = payload;
  return payload;
}`;

  const pythonSecretSnippet = `# Python Dynamic Secret Access via google-cloud-secret-manager
from google.cloud import secretmanager
import os

_cached_secret = None

def access_secret(secret_id: str = "${secretName}", version_id: str = "latest") -> str:
    global _cached_secret
    if os.environ.get(secret_id):
        return os.environ.get(secret_id)
        
    if _cached_secret:
        return _cached_secret

    client = secretmanager.SecretManagerServiceClient()
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT", "${projectId}")
    name = f"projects/{project_id}/secrets/{secret_id}/versions/{version_id}"
    response = client.access_secret_version(request={"name": name})
    _cached_secret = response.payload.data.decode("UTF-8")
    return _cached_secret`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
        <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
          <Key className="w-5 h-5 text-neutral-800" />
          Secret Management & Zero-Hardcoding Hygiene
        </h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Eliminate hardcoded credentials and automate Google Cloud Secret Manager IAM bindings for Cloud Run.
        </p>

        {/* Configuration inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-neutral-100">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">GCP Project ID:</label>
            <input
              type="text"
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Secret Manager Secret Name:</label>
            <input
              type="text"
              value={secretName}
              onChange={e => setSecretName(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Secret Scanner */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-neutral-800" />
            Static Secret Exposure Scanner
          </h3>
          <button
            onClick={handleScanSecrets}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-medium"
          >
            Scan for Leaked Keys
          </button>
        </div>
        <p className="text-xs text-neutral-500 mb-3">
          Paste any code snippet, YAML config, or env file to scan for exposed Google API keys (`AIzaSy...`), JWTs, or private keys.
        </p>

        <textarea
          rows={5}
          value={scannerInput}
          onChange={e => {
            setScannerInput(e.target.value);
            setScanFindings(scanForExposedSecrets(e.target.value));
          }}
          className="w-full font-mono text-xs px-3.5 py-2.5 rounded-lg border border-neutral-300 bg-neutral-950 text-neutral-100"
        />

        {scanFindings.length > 0 ? (
          <div className="mt-3 space-y-2">
            {scanFindings.map((f, i) => (
              <div
                key={i}
                className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs flex items-center justify-between text-red-900"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                  <span>
                    <strong>Line {f.line}:</strong> {f.type} ({f.match})
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-red-200 text-red-900 rounded font-mono text-[10px] font-bold">
                  {f.severity}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs flex items-center gap-2 text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Zero hardcoded secrets detected in snippet. Clean secret hygiene confirmed.</span>
          </div>
        )}
      </div>

      {/* Secret Manager CLI Script */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-neutral-800" />
            1. Google Cloud Secret Manager Provisioning & IAM Bindings
          </h3>
          <button
            onClick={() => copyToClipboard(gcloudSecretCommands, 'cli')}
            className="inline-flex items-center text-xs text-neutral-700 hover:text-neutral-900 font-medium"
          >
            {copiedKey === 'cli' ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            {copiedKey === 'cli' ? 'Copied' : 'Copy Commands'}
          </button>
        </div>

        <pre className="p-3.5 bg-neutral-950 text-neutral-100 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap">
          {gcloudSecretCommands}
        </pre>
      </div>

      {/* Code Snippets (Node.js & Python) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Node.js */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-700" />
              Node.js / TypeScript Integration
            </h3>
            <button
              onClick={() => copyToClipboard(nodeSecretSnippet, 'node')}
              className="inline-flex items-center text-xs text-neutral-700 hover:text-neutral-900 font-medium"
            >
              {copiedKey === 'node' ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copiedKey === 'node' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="p-3 bg-neutral-950 text-emerald-300 rounded-lg text-[11px] font-mono overflow-x-auto whitespace-pre-wrap">
            {nodeSecretSnippet}
          </pre>
        </div>

        {/* Python */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-blue-700" />
              Python Integration
            </h3>
            <button
              onClick={() => copyToClipboard(pythonSecretSnippet, 'py')}
              className="inline-flex items-center text-xs text-neutral-700 hover:text-neutral-900 font-medium"
            >
              {copiedKey === 'py' ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copiedKey === 'py' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="p-3 bg-neutral-950 text-blue-300 rounded-lg text-[11px] font-mono overflow-x-auto whitespace-pre-wrap">
            {pythonSecretSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
};
