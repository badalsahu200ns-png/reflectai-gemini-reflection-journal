export type ThreatZone =
  | 'Input Surfaces'
  | 'Planning & Reasoning'
  | 'Tool Execution'
  | 'Memory & State'
  | 'Inter-System Communication';

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export type UserRole = 'admin' | 'moderator' | 'member' | 'guest';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
  role?: UserRole;
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

export interface JournalLocation {
  name: string;
  lat: number;
  lng: number;
  address?: string;
  placeId?: string;
}

export interface AIMoodAnalysis {
  sentimentScore: number; // 0 (negative/stressed) to 100 (positive/joyful)
  energyLevel: number; // 1 to 10
  dominantMood: JournalMood;
  emotionalKeywords: string[];
  growthOpportunities: string[];
  mindfulnessAdvice: string;
  analyzedAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  category: 'Daily Reflection' | 'Brainstorming' | 'Decision Making' | 'Mindfulness' | 'Career & Goals' | 'Creative';
  mood?: JournalMood;
  tags: string[];
  turns: EntryTurn[];
  summary?: StructuredSummary | null;
  moodAnalysis?: AIMoodAnalysis | null;
  location?: JournalLocation | null;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  isPinned?: boolean;
  wordCount?: number;
}

export type JournalThemeId =
  | 'twilight'
  | 'sepia'
  | 'emerald'
  | 'rose'
  | 'ocean'
  | 'monochrome';

export interface JournalThemeConfig {
  id: JournalThemeId;
  name: string;
  description: string;
  previewBg: string;
  previewAccent: string;
  classes: {
    bg: string;
    card: string;
    border: string;
    accent: string;
    accentHover: string;
    textPrimary: string;
    textSecondary: string;
  };
}

export interface NotificationSettings {
  dailyReminderEnabled: boolean;
  dailyReminderTime: string; // e.g. "20:00"
  weeklyDigestEmailEnabled: boolean;
  digestEmail: string;
  slackWebhookUrl: string;
  slackEnabled: boolean;
  discordWebhookUrl: string;
  discordEnabled: boolean;
  notifyOnStreakMilestone: boolean;
  notifyOnWeeklySummary: boolean;
}

export interface WeeklyAISummary {
  id: string;
  userId: string;
  weekStartDate: string;
  weekEndDate: string;
  entryCount: number;
  totalWords: number;
  dominantMoods: string[];
  executiveSummary: string;
  emotionalTrajectory: string;
  keyBreakthroughs: string[];
  recurringChallenges: string[];
  actionPlan: string[];
  nextWeekPrompts: string[];
  generatedAt: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  lastJournaledDate: string | null;
  isStreakActiveToday: boolean;
  streakStatus: 'ACTIVE' | 'AT_RISK' | 'INACTIVE';
  milestones: {
    id: string;
    name: string;
    days: number;
    unlocked: boolean;
    unlockedAt?: string;
    badgeIcon: string;
  }[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userEmail?: string;
  userRole: UserRole;
  action: string;
  category: 'AUTH' | 'ENTRY_MUTATION' | 'AI_GENERATION' | 'NOTIFICATION' | 'SECURITY' | 'ADMIN';
  resource: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';
  details?: string;
  ipAddress?: string;
}

export interface ThreatItem {
  id: string;
  threatZone: ThreatZone;
  threatName: string;
  description: string;
  owaspMapping: string;
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
  overallRiskScore: number;
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
