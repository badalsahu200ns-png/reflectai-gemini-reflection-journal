export type ThreatZone =
  | 'Input Surfaces'
  | 'Planning & Reasoning'
  | 'Tool Execution'
  | 'Memory & State'
  | 'Inter-System Communication';

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
  createdAt?: string;
}

export type ReflectionActionType = 'reflection' | 'summary' | 'brainstorm' | 'continuation' | 'socratic';

export interface EntryTurn {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string; // ISO string
  actionType?: ReflectionActionType;
  modelUsed?: string;
}

export interface StructuredSummary {
  executiveSummary: string;
  keyThemes: string[];
  growthInsights: string[];
  actionItems: string[];
  followUpQuestions: string[];
  generatedAt: string;
}

export type JournalMood = 'Thoughtful' | 'Energized' | 'Calm' | 'Focused' | 'Anxious' | 'Curious' | 'Grateful';

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  category: 'Daily Reflection' | 'Brainstorming' | 'Decision Making' | 'Mindfulness' | 'Career & Goals' | 'Creative';
  mood?: JournalMood;
  tags: string[];
  turns: EntryTurn[];
  summary?: StructuredSummary | null;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  isPinned?: boolean;
  wordCount?: number;
}

export interface ThreatItem {
  id: string;
  threatZone: ThreatZone;
  threatName: string;
  description: string;
  owaspMapping: string; // e.g., "OWASP LLM01: Prompt Injection" or "OWASP A01: Broken Access"
  severity: SeverityLevel;
  attackVector: string;
  countermeasure: string;
  implementationCodeSnippet?: string;
  status: 'MITIGATED' | 'IN_PROGRESS' | 'UNRESOLVED';
}

export interface ThreatModelReport {
  id: string;
  systemName: string;
  architectureDescription: string;
  timestamp: string;
  threatSummaryTable: ThreatItem[];
  zoneBreakdown: {
    zone: ThreatZone;
    threatCount: number;
    highestSeverity: SeverityLevel;
    criticalRisks: string[];
  }[];
  executiveSummary: string;
  overallRiskScore: number; // 0 - 100
  modelUsed: string;
  fallbackTelemetry?: FallbackTelemetry;
}

export interface SecurityVulnerability {
  id: string;
  title: string;
  severity: SeverityLevel;
  category: string;
  cweOrOwasp: string;
  fileOrComponent: string;
  lineRange?: string;
  description: string;
  vulnerableCode: string;
  remediatedCode: string;
  explanation: string;
}

export interface SecurityReviewResult {
  id: string;
  targetType: 'CODE' | 'SYSTEM_PROMPT' | 'TOOL_SCHEMA' | 'FIRESTORE_RULES';
  timestamp: string;
  vulnerabilities: SecurityVulnerability[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    cleanRating: 'SECURE' | 'NEEDS_ATTENTION' | 'CRITICAL_RISK';
  };
  keyRecommendations: string[];
  modelUsed: string;
  fallbackTelemetry?: FallbackTelemetry;
}

export interface FallbackTelemetry {
  primaryModel: string;
  attemptedModels: string[];
  successfulModel: string;
  recoveredFromErrors: string[];
  latencyMs: number;
  tokensEstimate?: number;
}

export interface FirestoreRuleAnalysis {
  isValid: boolean;
  hasInsecureWildcards: boolean;
  hasOwnerBoundIsolation: boolean;
  hasRoleValidation: boolean;
  findings: {
    ruleMatch: string;
    status: 'SECURE' | 'VULNERABLE' | 'WARNING';
    message: string;
    suggestion?: string;
  }[];
  recommendedRules: string;
}

export interface TestCaseItem {
  id: string;
  module: string;
  testCaseName: string;
  description: string;
  preconditions: string;
  testSteps: string[];
  expectedResult: string;
  category: 'THREAT_MODELING' | 'SECURITY_REVIEW' | 'FALLBACK_LADDER' | 'PAYLOAD_HYGIENE' | 'FIRESTORE_AUTH' | 'DEPLOYMENT';
}

export interface CloudRunDeployConfig {
  projectName: string;
  region: string;
  serviceName: string;
  secretName: string;
  campaignLabel: string;
  firestoreMode: 'native' | 'datastore';
}
