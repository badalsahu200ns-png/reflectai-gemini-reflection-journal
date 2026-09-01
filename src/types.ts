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
  | 'balanced'
  | 'stoic'
  | 'empathetic'
  | 'growth_strategist'
  | string;

export interface AIPersona {
  id: AIPersonaId;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  tone: string;
  systemPrompt?: string;
  isCustom?: boolean;
}

export interface CustomAIPersona {
  id: string;
  userId?: string;
  name: string;
  tagline: string;
  description: string;
  tone: string;
  systemPrompt?: string;
  systemInstruction?: string;
  focusAreas?: string[];
  iconName?: string;
  isCustom?: boolean;
  isActive?: boolean;
  createdAt?: string;
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
  mood?: string;
  category?: string;
}

export interface AskJournalResponse {
  answer: string;
  citations: AskJournalCitation[];
  evidence?: AskJournalCitation[];
  insight?: string;
  pattern?: string;
  historicalComparison?: string;
  suggestedNextStep?: string;
  suggestedQuestions: string[];
  modelUsed?: string;
  latencyMs?: number;
  questionType?: string;
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
  | 'rose-garden'
  | 'lavender-dream'
  | 'sunset-bloom'
  | 'sakura-breeze'
  | 'botanical-serenity'
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

// -------------------------------------------------------------
// 9-CATEGORY COMPREHENSIVE ARCHITECTURE INTERFACES
// -------------------------------------------------------------

// Category 1: Daily Check-In
export interface DailyCheckIn {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mood: JournalMood;
  moodScale: number; // 1-10
  energyLevel: number; // 1-10
  stressLevel: number; // 1-10
  focusLevel: number; // 1-10
  motivationLevel: number; // 1-10
  gratitudeNote?: string;
  createdAt: string;
}

// Category 3: Dedicated Memories (Photo, Video, Voice, Written)
export type MemoryMediaType = 'photo' | 'video' | 'voice' | 'text';

export interface DedicatedMemoryItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  mediaType: MemoryMediaType;
  mediaUrl?: string;
  videoDurationSeconds?: number;
  audioDurationSeconds?: number;
  thumbnailUrl?: string;
  mood?: JournalMood;
  tags: string[];
  location?: JournalLocation | null;
  capturedAt: string;
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
  userWrittenNotes?: string;
  aiDescription?: string;
  aiVideoSummary?: {
    memoryTitle: string;
    whatHappened: string;
    keyMoments: string[];
    memorySummary: string;
    reflection: string;
    generatedAt: string;
  } | null;
  relatedEntryIds?: string[];
  relatedMemoryIds?: string[];
  capsuleIds?: string[];
}

// Category 4: AI Memories, Capsules, Connections & Stories
export interface MemoryCapsule {
  id: string;
  userId: string;
  title: string; // e.g. "College Journey", "Career Journey", "Family", "Travel", "Personal Growth", "2026 Memories"
  description: string;
  coverImageUrl?: string;
  colorGradient?: string;
  memoryIds: string[];
  entryIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MemoryConnectionNode {
  id: string;
  tripOrTheme: string;
  photoUrl?: string;
  journalEntryTitle: string;
  journalEntryId: string;
  mood: string;
  insight: string;
  date: string;
}

export interface MemoryStory {
  id: string;
  userId: string;
  title: string;
  storyNarrative: string;
  selectedMemoryIds: string[];
  timeframe: string;
  keyThemes: string[];
  reflectionTakeaway: string;
  createdAt: string;
}

// Category 5: AI Reflection & Life Intelligence
export interface LifeIntelligenceInsight {
  topic: string;
  insight: string;
  groundedJournalQuote: string;
  sourceEntryId?: string;
  sourceDate?: string;
  confidence: 'high' | 'medium';
}

export interface LifeIntelligenceData {
  userId: string;
  whatMattersToMe: LifeIntelligenceInsight[];
  whatEnergizesMe: LifeIntelligenceInsight[];
  whatDrainsMe: LifeIntelligenceInsight[];
  recurringPatterns: LifeIntelligenceInsight[];
  goalsSummary: LifeIntelligenceInsight[];
  growthObservations: LifeIntelligenceInsight[];
  biggestLessons: LifeIntelligenceInsight[];
  whatChangedRecently: LifeIntelligenceInsight[];
  lastSynthesizedAt: string;
}

// Category 6: Growth, Goals, Experiments & Reviews
export interface GoalMilestone {
  id: string;
  title: string;
  targetDate?: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface GrowthGoal {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: 'Personal' | 'Career' | 'Health' | 'Mindfulness' | 'Relationships' | 'Creative';
  targetDate: string;
  progressPercent: number; // 0-100
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  milestones: GoalMilestone[];
  relatedEntryIds: string[];
  relatedMemoryIds: string[];
  aiReflection?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalExperiment {
  id: string;
  userId: string;
  title: string; // e.g. "Wake up at 6:30 AM for 7 days", "No screens 1hr before bed"
  hypothesis: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  dailyCheckIns: {
    date: string;
    completed: boolean;
    moodScore: number;
    energyScore: number;
    notes?: string;
  }[];
  journalEvidenceCount: number;
  beforeAfterComparison?: {
    moodBefore: number;
    moodAfter: number;
    energyBefore: number;
    energyAfter: number;
    aiObservations: string;
    keyLearnings: string[];
  } | null;
  createdAt: string;
}

export interface PersonalMilestone {
  id: string;
  userId: string;
  title: string;
  date: string;
  category: string;
  description: string;
  linkedEntryIds: string[];
  linkedMediaUrls: string[];
  linkedGoalId?: string;
  aiSuggested?: boolean;
  createdAt: string;
}

export interface MemoryLetter {
  id: string;
  userId: string;
  type: 'FUTURE_SELF' | 'PAST_SELF' | 'YEAR_LEARNINGS';
  title: string;
  content: string;
  scheduledUnlockDate?: string;
  isUnlocked: boolean;
  createdAt: string;
}

export interface YearlyReviewData {
  id: string;
  userId: string;
  year: number;
  biggestMoments: string[];
  achievements: string[];
  challengesOvercome: string[];
  prominentThemes: string[];
  moodJourneyNarrative: string;
  personalGrowthSynthesis: string;
  importantPlaces: string[];
  goalsAccomplished: string[];
  biggestLessons: string[];
  majorChanges: string[];
  generatedAt: string;
}

// Category 7: Explore & Insights Library
export interface InsightsLibraryItem {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  sourceEntryId?: string;
  sourceMemoryId?: string;
  isPinned: boolean;
  createdAt: string;
}

// Category 8: Life Intelligence Interactive System
export type LifeIntelligenceSectionKey =
  | 'whatMattersToMe'
  | 'whatEnergizesMe'
  | 'whatDrainsMe'
  | 'recurringPatterns'
  | 'biggestLessons'
  | 'whatChangedRecently';

export interface UserWrittenLifeSection {
  id: string;
  userId: string;
  sectionKey: LifeIntelligenceSectionKey;
  userText: string;
  aiObservation?: string;
  whatINotice?: string;
  evidence?: AskJournalCitation[];
  questionToConsider?: string;
  possibleNextStep?: string;
  suggestedMemory?: string;
  lastReflectedAt?: string;
  updatedAt: string;
}

export interface PersonalProfileData {
  userId: string;
  whoIAm: string;
  whatMattersToMe: string;
  whatIEnjoy: string;
  whatIAmLearning: string;
  whatIAmWorkingToward: string;
  whatIWantToImprove: string;
  myValues: string;
  myPrinciples: string;
  importantGoals: string;
  careerInterests: string;
  importantPeople?: string;
  importantPlaces?: string;
  updatedAt: string;
}

export interface PersonalSwotData {
  userId: string;
  strengths: string;
  weaknesses: string;
  opportunities: string;
  threats: string;
  aiAnalysis?: {
    strengthsAnalysis: string;
    weaknessesAnalysis: string;
    opportunitiesAnalysis: string;
    threatsAnalysis: string;
    strategicRecommendations: string[];
    evidence: AskJournalCitation[];
    generatedAt: string;
  };
  updatedAt: string;
}

export interface StudentProfileData {
  userId: string;
  currentClass: string;
  subjects: string;
  strongSubjects: string;
  difficultSubjects: string;
  interests: string;
  skills: string;
  hobbies: string;
  careerInterests: string;
  preferredWorkEnvironment: string;
  financialPriorities: string;
  locationPreference: string;
  educationPreferences: string;
  updatedAt: string;
}

export interface After10thStreamOption {
  stream: string;
  whyFit: string;
  skillsRequired: string[];
  educationPath: string;
  possibleCareers: string[];
  advantages: string[];
  tradeoffs: string[];
  whatToExploreNext: string;
}

export interface After10thGuidanceResult {
  recommendedOptions: After10thStreamOption[];
  summary: string;
  disclaimer: string;
  generatedAt: string;
}

export interface CareerOption {
  id: string;
  careerName: string;
  whyFit: string;
  requiredSkills: string[];
  educationPath: string;
  timeToEntry: string;
  growthPotential: string;
  potentialChallenges: string;
  first3Steps: string[];
  questionsToConsider: string[];
  salaryInsight?: string;
  remoteOpportunities?: string;
}

export interface CareerComparisonItem {
  careerName: string;
  education: string;
  skills: string;
  cost: string;
  timeToEmployability: string;
  entryLevelOpportunities: string;
  longTermGrowth: string;
  workStyle: string;
  competition: string;
  earningRange: string;
  remoteOpportunities: string;
  internationalOpportunities: string;
}

export interface CareerRoadmapMilestone {
  id: string;
  title: string;
  stage: string;
  description: string;
  targetDate?: string;
  isCompleted: boolean;
  resources?: string[];
  journalReflectionsCount?: number;
}

export interface CareerRoadmap {
  id: string;
  userId: string;
  careerName: string;
  summary: string;
  milestones: CareerRoadmapMilestone[];
  createdAt: string;
  updatedAt: string;
}

export interface StudyQuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface StudyFlashcard {
  id: string;
  front: string;
  back: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface StudyPlanDay {
  dayNumber: number;
  focusArea: string;
  activities: string[];
  timeCommitmentMinutes?: number;
  activeRecallPrompt?: string;
}

export interface StudyCommonMistake {
  mistake: string;
  whyItHappens: string;
  howToAvoid: string;
}

export type StudyGuruMode =
  | 'concept_breakdown'
  | 'explain_like_12'
  | 'study_plan'
  | 'quiz_flashcards'
  | 'common_mistakes';

export interface StudyGuruResult {
  topic: string;
  mode: StudyGuruMode;
  targetExamOrLevel?: string;
  conceptExplanation?: {
    summary: string;
    intuitiveAnalogy?: string;
    keyPrinciples: string[];
  };
  studyPlanDays?: StudyPlanDay[];
  quizQuestions?: StudyQuizQuestion[];
  flashcards?: StudyFlashcard[];
  commonMistakes?: StudyCommonMistake[];
  generatedAt: string;
}

export interface GuruGuidancePath {
  pathName: string;
  advantages: string[];
  tradeoffs: string[];
}

export interface GuruGuidanceResult {
  coreDilemma: string;
  valuesAtStake: string[];
  alternativePaths: GuruGuidancePath[];
  ethicalConsiderations: string;
  introspectiveQuestion: string;
  practicalNextStep: string;
  generatedAt: string;
}

export interface PersonalPrinciple {
  id: string;
  userId: string;
  statement: string;
  context?: string;
  isPinned: boolean;
  linkedJournalEntries?: string[];
  createdAt: string;
}

export interface PersonalQuestion {
  id: string;
  userId: string;
  question: string;
  notes?: string;
  aiReflection?: string;
  isPinned: boolean;
  createdAt: string;
}

export interface FutureSelfLetter {
  id: string;
  userId: string;
  title: string;
  letter: string;
  whereIWantToBe: string;
  goalsAndPrinciples: string;
  resurfaceDate: string;
  isResurfaced: boolean;
  userFeedbackAfterResurface?: string;
  createdAt: string;
}

export interface ThenVsNowItem {
  dimension: string;
  thenSummary: string;
  thenDate?: string;
  nowSummary: string;
  nowDate?: string;
  shiftInsight: string;
  evidence?: AskJournalCitation[];
}

export interface RecurringStatementItem {
  statement: string;
  frequencyCount: number;
  progressStatus: string;
  deeperDriver: string;
}

export interface BeliefShiftItem {
  topic: string;
  oldBelief: string;
  newBelief: string;
  approximateDateOfShift: string;
  catalystEvent: string;
}

export interface WhatIKeepSayingItem {
  theme: string;
  firstMentionDate: string;
  recentMentionDate: string;
  entryCount: number;
  latestReflectionQuote: string;
  currentStatus: string;
}

export interface ChangingPerspectiveItem {
  topic: string;
  earlierView: string;
  recentView: string;
  evidence: AskJournalCitation[];
  interpretation: string;
}

// ==========================================
// GLOBAL CAREER PATHWAY ENGINE TYPES
// ==========================================

export interface CountryEducationStage {
  id: string;
  label: string;
  stageLevel: number; // 1: Lower secondary, 2: Grade 10 equiv, 3: Grade 11, 4: Grade 12 equiv, 5: Vocational/Diploma, 6: Bachelor, 7: Master, 8: Doctorate
  isSecondaryGate?: boolean; // True if Grade 10 / Secondary exit point
}

export interface CountryData {
  countryCode: string;
  countryName: string;
  region: 'Asia' | 'North America' | 'Europe' | 'Oceania' | 'Africa';
  flagEmoji: string;
  educationFrameworkName: string;
  educationStages: CountryEducationStage[];
  grade10EquivName: string;
  grade12EquivName: string;
  vocationalSystemName: string;
  primaryLanguage: string;
}

export interface OccupationTaxonomyCategory {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export interface OccupationItem {
  id: string;
  title: string;
  category: string;
  isRegulated: boolean;
  briefDescription: string;
  defaultSkills: string[];
}

export interface CareerEntryRoute {
  id: 'university' | 'vocational' | 'experience' | 'certification' | 'career_change' | 'skills_first';
  name: string;
  badgeEmoji: string;
  summary: string;
  steps: string[];
  typicalDuration: string;
  advantages: string[];
  tradeoffs: string[];
  recommendedFor: string;
}

export interface RegulatedProfessionDetails {
  isRegulated: boolean;
  licensingBody: string;
  mandatoryDegree: string;
  mandatoryExaminations: string[];
  internshipOrResidency: string;
  languageRequirements: string;
  foreignQualificationRecognition: string;
  statutoryDisclaimer: string;
}

export interface CareerProgressionStage {
  stageName: string;
  typicalTitle: string;
  experienceYears: string;
  focusSkills: string[];
  description: string;
}

export interface CareerFitAnalysis {
  strongMatches: string[];
  skillsToDevelop: string[];
  educationGaps: string[];
  experienceGaps: string[];
  questionsToExplore: string[];
}

export interface MilestoneRoadmapStage {
  stageNumber: number;
  stageTitle: string;
  timeframe: string;
  description: string;
  actionItems: string[];
  isCompleted?: boolean;
}

export interface GlobalCareerPathway {
  id: string;
  countryCode: string;
  countryName: string;
  flagEmoji: string;
  educationFramework: string;
  occupation: string;
  occupationCategory: string;
  currentEducationId: string;
  currentEducationLabel: string;
  
  minimumEducationRequirement: string;
  preferredEducationRequirement: string;
  requiredSkills: string[];
  recommendedSkills: string[];
  requiredCertifications: string[];
  recommendedCertifications: string[];
  practicalExperienceRequired: string;
  internshipApprenticeshipInfo: string;
  
  entryLevelJobTitles: string[];
  entryRoutes: CareerEntryRoute[];
  
  regulatedDetails: RegulatedProfessionDetails;
  
  afterGrade10Details?: {
    academicStream: string;
    vocationalPath: string;
    apprenticeshipOptions: string;
    diplomaCertificates: string;
    approxTimeToEntry: string;
    criticalDecisions: string[];
  };
  
  careerProgression: CareerProgressionStage[];
  fitAnalysis?: CareerFitAnalysis;
  milestoneRoadmap: MilestoneRoadmapStage[];
  
  verification: {
    lastVerifiedDate: string;
    sourceOrganization: string;
    sourceUrl?: string;
    confidenceNote: string;
  };
  
  next3Actions: string[];
  generatedAt: string;
}

export interface InternationalRecognitionResult {
  fromCountry: string;
  fromCountryFlag: string;
  toCountry: string;
  toCountryFlag: string;
  qualificationOrProfession: string;
  recognitionFeasibility: 'Direct / High' | 'Partial / Requires Evaluation' | 'Substantial Additional Training' | 'Restricted / Re-licensing Required';
  credentialEvaluationBody: string;
  professionalLicensingRequirements: string;
  languageRequirements: string;
  workExperienceRequirements: string;
  typicalGapsAndBridgePrograms: string[];
  disclaimer: string;
  verifiedSources: { name: string; url?: string }[];
  generatedAt: string;
}

export interface CountryComparisonItem {
  countryCode: string;
  countryName: string;
  flagEmoji: string;
  educationSystemRoute: string;
  typicalDuration: string;
  regulationStatus: string;
  vocationalApprenticeshipAvailability: string;
  skillsFirstFeasibility: string;
  primaryEntryCredentials: string[];
  sourceOrganization: string;
}

export interface CountryComparisonResult {
  occupation: string;
  countries: CountryComparisonItem[];
  generatedAt: string;
}

export interface UserSavedCareerRoadmap {
  id: string;
  userId: string;
  countryCode: string;
  countryName: string;
  occupation: string;
  targetRole: string;
  currentEducation: string;
  preferredRoute: string;
  milestones: {
    stageNumber: number;
    title: string;
    timeframe: string;
    description: string;
    actions: { text: string; completed: boolean }[];
  }[];
  customNotes?: string;
  updatedAt: string;
}

export * from './services/notifications/types';

