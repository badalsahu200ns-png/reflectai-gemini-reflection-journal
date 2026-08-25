import { ThreatItem, ThreatZone } from '../types';

/**
 * Strict Undefined-Stripping (Zero-Crash Payload Hygiene)
 * Recursively removes undefined and functions from payload objects before sending to DB or API
 */
export function stripUndefinedDeep<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(stripUndefinedDeep) as unknown as T;
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (value !== undefined && typeof value !== 'function') {
        cleaned[key] = stripUndefinedDeep(value);
      }
    }
    return cleaned as unknown as T;
  }
  return obj;
}

/**
 * OWASP Top 10 for LLM Applications (2025/2026 standard)
 */
export const OWASP_LLM_TOP_10 = [
  {
    code: 'LLM01',
    name: 'Prompt Injection',
    description: 'Manipulating LLM behavior via crafted inputs causing the model to disregard instructions or execute unintended tasks.',
    mitigation: 'Separate untrusted data from system instructions with distinct delimiters, use defensive framing, employ secondary verification classifiers, and restrict model agency.'
  },
  {
    code: 'LLM02',
    name: 'Sensitive Information Disclosure',
    description: 'Unintended exposure of confidential data, PII, internal prompts, or credentials in model outputs.',
    mitigation: 'Implement rigorous data scrubbing/DLP on both prompts and completions; apply least privilege on retrieved context; enforce strict owner-isolation.'
  },
  {
    code: 'LLM03',
    name: 'Supply Chain Vulnerabilities',
    description: 'Compromised third-party datasets, pre-trained base models, plugins, or dependencies.',
    mitigation: 'Vet model origins, pin and cryptographically verify packages, audit third-party plugins, enforce strict SBOM compliance.'
  },
  {
    code: 'LLM04',
    name: 'Data and Model Poisoning',
    description: 'Tainted training, fine-tuning, or RAG reference data creating deliberate backdoors or biased reasoning.',
    mitigation: 'Verify provenance and cryptographic hashes of embeddings and retrieval documents; maintain strict role isolation on RAG repositories.'
  },
  {
    code: 'LLM05',
    name: 'Improper Output Handling',
    description: 'Blindly passing LLM outputs into downstream interpreters (eval, shell, SQL, raw innerHTML).',
    mitigation: 'Treat all LLM output as untrusted user input; validate against strict JSON schemas; encode before rendering in DOM; parameterize database queries.'
  },
  {
    code: 'LLM06',
    name: 'Excessive Agency',
    description: 'Granting an LLM agent excessive permissions, autonomous destructive tool access, or unrestrained system execution.',
    mitigation: 'Enforce human-in-the-loop (HITL) for state-modifying actions; apply granular least privilege per tool; isolate execution in ephemeral sandboxes.'
  },
  {
    code: 'LLM07',
    name: 'System Prompt Leakage',
    description: 'Extracting private system instructions, proprietary workflows, or hidden safeguards through adversarial queries.',
    mitigation: 'Do not place secrets or proprietary algorithms directly in system prompts; treat system prompts as potentially readable; use canary phrases for detection.'
  },
  {
    code: 'LLM08',
    name: 'Vector and Embedding Weaknesses',
    description: 'Adversarial manipulation of semantic search vectors to inject malicious context into RAG pipelines.',
    mitigation: 'Enforce namespace isolation in vector stores; validate cosine similarity bounds; apply document-level access control tags before retrieval.'
  },
  {
    code: 'LLM09',
    name: 'Misinformation & Hallucination',
    description: 'Generating fabricated facts, phantom APIs, or insecure code recommendations as authentic truths.',
    mitigation: 'Ground generation using trusted search or enterprise knowledge bases; configure low temperature; instruct model to cite sources or admit uncertainty.'
  },
  {
    code: 'LLM10',
    name: 'Unbounded Consumption',
    description: 'Denial of service through excessive token consumption, infinite reasoning loops, or high-volume concurrent inference.',
    mitigation: 'Enforce strict token quotas, request rate limiting, hard maxOutputTokens ceilings, and timeouts on agentic thought loops.'
  }
];

export const THREAT_ZONES: { zone: ThreatZone; icon: string; description: string; keyRisks: string[] }[] = [
  {
    zone: 'Input Surfaces',
    icon: 'ShieldAlert',
    description: 'Entry points for prompts, multimodal uploads, webhook payloads, and untrusted user data.',
    keyRisks: ['Direct Prompt Injection', 'Malicious File Payload (Polyglot)', 'SSRF via URL parameters', 'Unbounded Request Flooding']
  },
  {
    zone: 'Planning & Reasoning',
    icon: 'BrainCircuit',
    description: 'Internal decision loops, instruction parsing, jailbreak mitigation, and tool routing selection.',
    keyRisks: ['Instruction Hijacking', 'System Prompt Leakage', 'Goal Subversion & Persona Drift', 'Adversarial Logic Confusion']
  },
  {
    zone: 'Tool Execution',
    icon: 'Terminal',
    description: 'Execution of API functions, database modifications, code execution sandboxes, and outbound calls.',
    keyRisks: ['Privilege Escalation via Tool Parameters', 'Remote Code Execution (RCE)', 'Server-Side Request Forgery', 'Unrestricted File System Write']
  },
  {
    zone: 'Memory & State',
    icon: 'Database',
    description: 'Firestore state persistence, session cookies, vector embeddings, and cross-user context isolation.',
    keyRisks: ['Insecure Firestore Defaults (allow read, write: if true)', 'Cross-Tenant Context Contamination', 'Session Hijacking', 'Unprotected Vector Memory Injection']
  },
  {
    zone: 'Inter-System Communication',
    icon: 'Network',
    description: 'External API calls (Google Maps, Workspace, Payment Gateways) and token transit.',
    keyRisks: ['API Key Transit in Client Headers', 'Unsigned Webhook Ingestion', 'OAuth Token Interception', 'Egress Data Exfiltration']
  }
];

/**
 * Secret Hygiene Pattern Checker
 */
export function scanForExposedSecrets(text: string): { type: string; match: string; line: number; severity: 'CRITICAL' | 'HIGH' }[] {
  const findings: { type: string; match: string; line: number; severity: 'CRITICAL' | 'HIGH' }[] = [];
  const lines = text.split('\n');

  const patterns = [
    { name: 'Google API Key (AIzaSy...)', regex: /AIzaSy[0-9A-Za-z\-_]{33}/g, severity: 'CRITICAL' as const },
    { name: 'Generic Hardcoded API Key assignment', regex: /(?:apiKey|api_key|secret_key|client_secret)\s*[:=]\s*["'][a-zA-Z0-9_\-]{16,}["']/gi, severity: 'CRITICAL' as const },
    { name: 'Firebase Service Account JSON Private Key', regex: /"private_key":\s*"-----BEGIN PRIVATE KEY-----/g, severity: 'CRITICAL' as const },
    { name: 'Bearer Token string constant', regex: /["']Bearer\s+[a-zA-Z0-9_\-\.]{20,}["']/gi, severity: 'HIGH' as const },
    { name: 'Hardcoded JWT Token', regex: /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g, severity: 'HIGH' as const },
    { name: 'Insecure Firestore Rule (allow all)', regex: /allow\s+(?:read|write|read,\s*write|get|list|create|update|delete)\s*:\s*if\s+true\s*;/gi, severity: 'CRITICAL' as const }
  ];

  lines.forEach((line, idx) => {
    patterns.forEach(pat => {
      const matches = line.match(pat.regex);
      if (matches) {
        matches.forEach(m => {
          findings.push({
            type: pat.name,
            match: m.length > 40 ? m.substring(0, 37) + '...' : m,
            line: idx + 1,
            severity: pat.severity
          });
        });
      }
    });
  });

  return findings;
}

/**
 * Validates Firestore Rules for zero insecure defaults and owner-bound isolation
 */
export function analyzeFirestoreRules(rulesCode: string): {
  isSecure: boolean;
  score: number;
  findings: { level: 'ERROR' | 'WARNING' | 'PASS'; message: string; ruleLine?: string }[];
} {
  const findings: { level: 'ERROR' | 'WARNING' | 'PASS'; message: string; ruleLine?: string }[] = [];
  let score = 100;

  if (!rulesCode.includes("rules_version = '2'") && !rulesCode.includes('rules_version = "2"')) {
    findings.push({
      level: 'WARNING',
      message: "Missing rules_version = '2'; declaration at top of file."
    });
    score -= 15;
  } else {
    findings.push({
      level: 'PASS',
      message: "Modern Firestore rules version '2' declared."
    });
  }

  // Check for insecure allow true
  const insecureMatch = rulesCode.match(/allow\s+[^:]+:\s*if\s+true\s*;/gi);
  if (insecureMatch) {
    findings.push({
      level: 'ERROR',
      message: 'CRITICAL: Insecure default detected (`allow ... if true;`). Unauthenticated read/write creates complete database exposure.',
      ruleLine: insecureMatch[0]
    });
    score -= 60;
  } else {
    findings.push({
      level: 'PASS',
      message: 'No unauthenticated `if true;` open wildcards found.'
    });
  }

  // Check for owner-bound path checking
  if (rulesCode.includes('request.auth.uid == userId') || rulesCode.includes('request.auth.uid == resource.data.userId') || rulesCode.includes('request.auth != null && request.auth.uid == userId')) {
    findings.push({
      level: 'PASS',
      message: 'Owner-bound path checking detected (`request.auth.uid == userId`). Personal documents are strictly isolated.'
    });
  } else {
    findings.push({
      level: 'WARNING',
      message: 'No explicit owner-bound validation (`request.auth.uid == userId`) detected in document paths.'
    });
    score -= 25;
  }

  // Check for auth check
  if (rulesCode.includes('request.auth != null')) {
    findings.push({
      level: 'PASS',
      message: 'Authentication check `request.auth != null` enforces authenticated access.'
    });
  } else {
    findings.push({
      level: 'WARNING',
      message: 'Missing explicit `request.auth != null` authentication barrier.'
    });
    score -= 20;
  }

  return {
    isSecure: score >= 75 && !insecureMatch,
    score: Math.max(0, score),
    findings
  };
}
