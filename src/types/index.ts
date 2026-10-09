export type Lang = 'az' | 'en' | 'ru';
export const LANGS: Lang[] = ['az', 'en', 'ru'];

/** A string available in every supported language. */
export type L10n = Record<Lang, string>;

/* ───────────────────────── Users & auth ───────────────────────── */

export type Role = 'parent' | 'specialist';

export interface BaseUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface ParentAccount extends BaseUser {
  role: 'parent';
}

export interface SpecialistAccount extends BaseUser {
  role: 'specialist';
  specialistId: string;
}

export type User = ParentAccount | SpecialistAccount;

export interface AuthSession {
  userId: string;
  role: Role;
  signedInAt: string;
}

/* ───────────────────────── Children ───────────────────────── */

export type DiagnosisStatus = 'confirmed' | 'suspected' | 'in_progress';
export type SensitivityLevel = 'low' | 'medium' | 'high';
export type CommunicationLevel = 'verbal' | 'phrases' | 'single_words' | 'nonverbal';

export type ConditionKey =
  | 'adhd'
  | 'intellectual'
  | 'speech_delay'
  | 'epilepsy'
  | 'anxiety'
  | 'sleep'
  | 'gastro'
  | 'feeding'
  | 'sensory_processing'
  | 'dyspraxia'
  | 'ocd'
  | 'tics'
  | 'hearing_vision'
  | 'genetic'
  | 'other';

export interface MedicalEntry {
  id: string;
  date: string;
  doctor: string;
  specialty: string;
  institution: string;
  diagnosis: string;
  notes: string;
  recommendations: string;
  nextAppointment: string;
}

export interface SensoryPreferences {
  sound: SensitivityLevel;
  light: SensitivityLevel;
  touch: SensitivityLevel;
}

export interface AvatarConfig {
  skin: string;
  hair: string;
  hairStyle: 'puffs' | 'short' | 'curly' | 'bob' | 'long';
  shirt: string;
  accent: string;
}

export type ProfileSection = 'basic' | 'diagnosis' | 'conditions' | 'medical' | 'health' | 'daily';

export interface ChildProfile {
  id: string;
  parentId: string;
  name: string;
  birthDate: string;
  avatar: AvatarConfig;
  diagnosisStatus: DiagnosisStatus | '';
  supportLevel: 1 | 2 | 3 | null;
  icdCode: string;
  conditions: ConditionKey[];
  conditionsOther: string;
  medicalHistory: MedicalEntry[];
  chronicConditions: string;
  allergies: string;
  medications: string;
  communicationLevel: CommunicationLevel | '';
  altCommunication: string[];
  sensory: SensoryPreferences;
  interests: string[];
  therapies: string[];
  /** Sections the parent explicitly reviewed (also counts "none" answers as complete). */
  reviewedSections: ProfileSection[];
  demo: boolean;
}

/* ───────────────────────── Learning content ───────────────────────── */

export type Skill = 'hygiene' | 'safety' | 'emotions' | 'sequencing' | 'attention';
export const CORE_SKILLS: Skill[] = ['hygiene', 'safety', 'emotions'];

export type SceneKind = 'sink' | 'road' | 'light' | 'faces';

export interface ChoiceOption {
  id: string;
  label: L10n;
  /** Visual key rendered by the lesson visual registry. */
  visual: string;
}

export interface InfoStep {
  kind: 'info';
  id: string;
  title: L10n;
  body: L10n;
  visual: string;
}

export interface ChoiceStep {
  kind: 'choice';
  id: string;
  prompt: L10n;
  /** Optional illustration shown above the choices. */
  visual?: string;
  options: ChoiceOption[];
  correctId: string;
  hint: L10n;
  explanation: L10n;
}

export interface TapStep {
  kind: 'tap';
  id: string;
  prompt: L10n;
  scene: SceneKind;
  /** Interactive objects inside the scene. */
  targets: ChoiceOption[];
  correctId: string;
  hint: L10n;
  explanation: L10n;
  success: L10n;
}

export interface SequenceStep {
  kind: 'sequence';
  id: string;
  prompt: L10n;
  /** Items in the correct order. */
  items: ChoiceOption[];
  hint: L10n;
  explanation: L10n;
}

export type LessonStep = InfoStep | ChoiceStep | TapStep | SequenceStep;
export type QuestionStep = ChoiceStep | TapStep | SequenceStep;

export interface Lesson {
  slug: string;
  skill: Skill;
  title: L10n;
  subtitle: L10n;
  goal: L10n;
  minutes: number;
  theme: 'hygiene' | 'safety' | 'emotions';
  steps: LessonStep[];
}

export interface RoutineRound {
  id: string;
  title: L10n;
  items: ChoiceOption[];
  hint: L10n;
}

export interface OddRound {
  id: string;
  prompt: L10n;
  items: { id: string; emoji: string; label: L10n; tone: string }[];
  correctId: string;
  hint: L10n;
  explanation: L10n;
}

export interface Game {
  slug: string;
  skill: Skill;
  title: L10n;
  subtitle: L10n;
  instructions: L10n;
  minutes: number;
  theme: 'routine' | 'odd';
}

/* ───────────────────────── Learning history ───────────────────────── */

export interface StepAttempt {
  stepId: string;
  skill: Skill;
  attempts: number;
  hintUsed: boolean;
  /** Resolved correctly within three attempts. */
  resolved: boolean;
  responseMs: number;
}

export interface LearningSession {
  id: string;
  childId: string;
  activityType: 'lesson' | 'game';
  activitySlug: string;
  skill: Skill;
  startedAt: string;
  completedAt: string;
  completed: boolean;
  steps: StepAttempt[];
  demo: boolean;
}

export interface InProgressActivity {
  slug: string;
  activityType: 'lesson' | 'game';
  stepIndex: number;
  steps: StepAttempt[];
  startedAt: string;
  updatedAt: string;
}

/* ───────────────────────── Observations ───────────────────────── */

export type Mood = 1 | 2 | 3 | 4 | 5;
export type SleepQuality = 'good' | 'ok' | 'poor';

export interface DailyObservation {
  id: string;
  childId: string;
  date: string; // YYYY-MM-DD
  mood: Mood;
  sleep: SleepQuality;
  crisis: boolean;
  note: string;
  demo: boolean;
  updatedAt: string;
}

/* ───────────────────────── Reports ───────────────────────── */

export interface ReportItem {
  key: string;
  params?: Record<string, string | number>;
}

export interface ReportMetricsSnapshot {
  firstTry: number;
  completion: number;
  difficult: number;
  avgResponseSec: number;
  sessions: number;
  trendDelta: number | null;
}

export interface LearningReport {
  id: string;
  childId: string;
  createdAt: string;
  periodDays: number;
  metrics: ReportMetricsSnapshot;
  summary: ReportItem[];
  strengths: ReportItem[];
  attention: ReportItem[];
  homeActivities: [ReportItem, ReportItem, ReportItem];
  nextLessons: string[];
  consultation: ReportItem | null;
  demo: boolean;
}

/* ───────────────────────── Marketplace ───────────────────────── */

export type SpecialtyKey = 'speech' | 'special_ed' | 'aba' | 'psychology' | 'ot';
export type ConsultFormat = 'online' | 'in_person' | 'hybrid';

export interface Specialist {
  id: string;
  name: string;
  title: L10n;
  specialties: SpecialtyKey[];
  experienceYears: number;
  city: string;
  district: L10n;
  format: ConsultFormat;
  languages: Lang[];
  priceMin: number;
  priceMax: number;
  ageMin: number;
  ageMax: number;
  bio: L10n;
  approach: L10n;
  verified: boolean;
  rating: number;
  sessionsCount: number;
  palette: [string, string];
  initials: string;
  /** True for the specialist profile linked to the specialist demo account. */
  demoAccount?: boolean;
}

export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'canceled' | 'revoked' | 'closed';

export interface SpecialistRequest {
  id: string;
  parentId: string;
  parentName: string;
  childId: string;
  specialistId: string;
  message: string;
  goals: string[];
  consentAt: string;
  createdAt: string;
  updatedAt: string;
  status: RequestStatus;
  history: { status: RequestStatus; at: string; by: Role }[];
  demo: boolean;
}

/** Read-only child summary for children of other fictional families shown to the specialist. */
export interface ExternalChild {
  profile: ChildProfile;
  snapshot: ReportMetricsSnapshot;
}

/* ───────────────────────── App state ───────────────────────── */

export type MotionPref = 'system' | 'reduce' | 'full';

export interface Preferences {
  language: Lang;
  soundEnabled: boolean;
  motion: MotionPref;
}

export interface AppData {
  version: number;
  seededOn: string; // YYYY-MM-DD of the last demo date rebase
  children: ChildProfile[];
  selectedChildId: string;
  sessions: LearningSession[];
  progress: Record<string, Record<string, InProgressActivity>>;
  observations: DailyObservation[];
  reports: LearningReport[];
  requests: SpecialistRequest[];
}
