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

export type AIPersonaId =
  | 'calm_coach'
  | 'socratic'
  | 'minimalist'
  | 'mentor'
  | 'pattern_finder'
  | 'balanced';

export interface AIPersona {
  id: AIPersonaId;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  tone: string;
}

export interface AIMemory {
  id: string;
  userId: string;
  text: string;
  category: 'Goals' | 'Habits' | 'Relationships' | 'Mindset' | 'Work & Projects' | 'General';
  sourceEntryId?: string;
  createdAt: string;
  isActive: boolean;
}

export interface StructuredRAGReflection {
  whatIHear: string;
  whatStandsOut: string;
  connectionToHistory: string;
  reflection: string;
  questionToConsider: string;
  smallNextStep: string;
  extractedMemories?: string[];
  followUpPrompts?: string[];
  sentimentScore?: number;
  energyLevel?: number;
  emotionalKeywords?: string[];
  generatedAt: string;
  personaUsed?: AIPersonaId;
  modelUsed?: string;
}

export interface AskJournalCitation {
  entryId: string;
  title: string;
  date: string;
  excerpt: string;
}

export interface AskJournalResponse {
  answer: string;
  citations: AskJournalCitation[];
  suggestedQuestions: string[];
  modelUsed?: string;
  latencyMs?: number;
}

export interface JournalAttachment {
  id: string;
  url: string;
  caption?: string;
  mimeType: string;
  name: string;
  sizeBytes?: number;
  createdAt: string;
}

export interface ImageAnalysisResult {
  summary: string;
  connection?: string;
  extractedText?: string;
  mood?: string;
  visualHighlights?: string[];
  suggestedCaption?: string;
}

export interface OCRResult {
  transcribedText: string;
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'REMINDER' | 'WEEKLY_SUMMARY' | 'MONTHLY_SUMMARY' | 'STREAK' | 'MEMORY_INSIGHT' | 'SYSTEM';
  timestamp: string;
  isRead: boolean;
  actionTab?: string;
  actionEntryId?: string;
}

export interface AdminOperationalMetrics {
  timestamp: string;
  status: string;
  users: {
    totalUsers: number;
    activeToday: number;
    activeThisWeek: number;
    activeThisMonth: number;
    retentionRatePercent: number;
  };
  journaling: {
    totalEntriesRecorded: number;
    entriesCreatedToday: number;
    entriesCreatedThisWeek: number;
    entriesCreatedThisMonth: number;
    averageWordsPerEntry: number;
  };
  aiOperations: {
    totalGeminiRequests: number;
    reflectionsGenerated: number;
    askJournalQueries: number;
    summariesSynthesized: number;
    ocrScansProcessed: number;
    averageModelLatencyMs: number;
    apiErrorRatePercent: number;
    activeModelLadder: string[];
  };
  featureAdoption: {
    voiceJournalingUsage: string;
    photoAttachmentUsage: string;
    locationTaggingUsage: string;
    handwrittenOcrUsage: string;
    inAppRemindersEnabled: string;
    exportDataUsage: string;
  };
  systemHealth: {
    uptimeSeconds: number;
    memoryUsageMb: number;
    firestoreRuleSet: string;
    zeroTrustViolations: number;
    threatsNeutralized: number;
    owaspScore: number;
  };
}

export interface ContextualPrompt {
  id: string;
  category: string;
  promptText: string;
  rationale: string;
}

export interface UserPreferences {
  userId: string;
  reflectionPersona: AIPersonaId;
  reflectionLength: 'concise' | 'balanced' | 'deep';
  aiMemoryEnabled: boolean;
  gamificationEnabled: boolean;
  theme: JournalThemeId;
  dailyReminderTime: string;
  dailyReminderEnabled: boolean;
  updatedAt: string;
}

export interface MonthlyAISummary {
  id: string;
  userId: string;
  month: string; // e.g. "2026-08"
  entryCount: number;
  totalWords: number;
  executiveSummary: string;
  monthlyThemes: { theme: string; description: string }[];
  moodTrendNarrative: string;
  recurringConcerns: string[];
  progressAndMilestones: string[];
  comparisonWithPrevious: string;
  reflectionQuestions: string[];
  nextMonthIntentions: string[];
  generatedAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content?: string;
  category: 'Daily Reflection' | 'Brainstorming' | 'Decision Making' | 'Mindfulness' | 'Career & Goals' | 'Creative';
  mood?: JournalMood;
  moodScale?: number; // 1 to 10
  emotions?: string[];
  tags: string[];
  turns: EntryTurn[];
  summary?: StructuredSummary | null;
  ragReflection?: StructuredRAGReflection | null;
  moodAnalysis?: AIMoodAnalysis | null;
  location?: JournalLocation | null;
  attachments?: JournalAttachment[];
  inputMethod?: 'text' | 'voice' | 'ocr' | 'photo';
  favorite?: boolean;
  archived?: boolean;
  privacyLevel?: 'private' | 'standard';
  personaUsed?: AIPersonaId;
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

export type NotificationProviderType = 'in_app' | 'email' | 'slack' | 'discord';

export type NotificationEventType =
  | 'weekly_summary_ready'
  | 'monthly_summary_ready'
  | 'journal_goal_completed'
  | 'selected_tag_detected'
  | 'insight_generated';

export type NotificationPayloadLevel = 'minimal' | 'summary' | 'detailed';

export interface NotificationPayload {
  title: string;
  summary?: string;
  deepLink?: string;
  category?: string;
  tag?: string;
  timestamp?: string;
  detailedExcerpt?: string;
}

export interface NotificationEvent {
  id: string;
  provider: NotificationProviderType;
  eventType: NotificationEventType;
  userId: string;
  notificationId: string;
  payload: NotificationPayload;
  createdAt: string;
}

export interface IntegrationConfig {
  id: string;
  userId: string;
  provider: 'email' | 'slack' | 'discord';
  status: 'connected' | 'disconnected' | 'pending';
  connectedAt?: string;
  lastUsedAt?: string;
  workspaceName?: string;
  channelName?: string;
  emailAddress?: string;
  webhookUrlSnippet?: string; // Display snippet only, e.g. "••••••••/T024/B01..."
  payloadLevel: NotificationPayloadLevel;
  enabledEvents: NotificationEventType[];
  triggerTag?: string; // Optional tag trigger e.g. "goal", "achievement", "important"
}

export interface NotificationAuditLog {
  id: string;
  userId: string;
  provider: NotificationProviderType;
  eventType: NotificationEventType;
  status: 'SUCCESS' | 'FAILURE' | 'RATE_LIMITED' | 'RETRYING';
  createdAt: string;
  completedAt?: string;
  errorCode?: string;
  errorMessage?: string;
  latencyMs?: number;
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
  payloadLevel?: NotificationPayloadLevel;
  integrations?: {
    email?: IntegrationConfig;
    slack?: IntegrationConfig;
    discord?: IntegrationConfig;
  };
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

export * from './services/notifications/types';

