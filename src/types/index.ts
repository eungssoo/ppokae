export type ViewType = 
  | 'login' 
  | 'menu' 
  | 'generate' 
  | 'solve_select' 
  | 'solve_personal_select' 
  | 'solve' 
  | 'weakness_view' 
  | 'ranking_board' 
  | 'incorrect_list' 
  | 'db_view'
  | 'expression_select'
  | 'expression_study'
  | 'bookmark_view'
  | 'analytics_view'
  | 'profile_view';

export type QuizMode = 'normal' | 'personal' | 'daily' | 'expression' | 'bookmark';

export type AvatarGrade = 'starter' | 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'transcendent';

export interface AvatarItem {
  id: string;
  name: string;
  icon: string;
  grade: AvatarGrade;
  quote: string;
  desc: string;
  color: string;
  bgGradient: string;
  dropRatePercent?: number;
  duplicateRefund: number;
}

export interface QuestionOption {
  text: string;
  is_correct: boolean;
  feedback: string;
}

export type Option = QuestionOption;

export interface QuestionExplanation {
  chunk_pattern: string;
  nuance: string;
}

export interface QuestionComponent {
  part: string;
  word: string;
}

export interface Question {
  id?: string;
  form: number;
  sentence: string;
  options: QuestionOption[];
  answer: string;
  translation: string;
  explanation: QuestionExplanation;
  components?: QuestionComponent[];
  difficulty?: string;
  level?: string;
  createdAt?: any;
}

export interface FormMastery {
  form: number;
  total: number;
  correct: number;
  accuracy: number;
  grade: 'S' | 'A' | 'B' | 'C';
}

export interface UserProfile {
  name: string;
  pin: string;
  coins?: number;
  bookmarkLimit?: number;
  avatar?: string;
  currentAvatarId?: string;
  unlockedAvatars?: string[];
  xp?: number;
  tier?: string;
  dailyGoal?: number;
  totalSolved?: number;
  totalCorrect?: number;
  email?: string;
  photoURL?: string;
  lastGeneratedAt?: number;
  isAdmin?: boolean;
  createdAt?: number;
}

export interface SystemSettings {
  rewardCoinsPerQuestion: number;
  starterCoins: number;
  gachaCost: number;
  changeNicknameCost: number;
  expandBookmarkCost: number;
  geminiModel: string;
  maintenanceMode: boolean;
  maintenanceNotice?: string;
}

export interface PushAnnouncement {
  id: string;
  title: string;
  content: string;
  badgeType: 'event' | 'notice' | 'update' | 'maintenance';
  rewardCoins?: number;
  createdAt: number;
  expiresAt?: number;
  isActive: boolean;
  authorName: string;
  targetUserName?: string; // 개인 특정 유저 발송 시 닉네임
}

export interface WeaknessRecord {
  id: string;
  userName: string;
  difficulty: string;
  form: number;
  sentence: string;
  wrongAnswer: string;
  correctAnswer: string;
  createdAt?: any;
  date?: string;
}

export interface WeaknessAnalysis {
  total: number;
  forms: Record<number, number>;
}

export interface RankingItem {
  name: string;
  score: number;
  completedAt?: number;
  completedAtFormatted?: string;
  avatarId?: string;
  avatarIcon?: string;
  avatarName?: string;
  avatarGrade?: string;
  avatarBgGradient?: string;
  avatarColor?: string;
}

export interface DifficultyLevel {
  level: number;
  label: string;
  desc: string;
}

export interface CycleInfo {
  cycleId: string;
  cycleIndex: 1 | 2 | 3;
  cycleName: string;
  startTimeStr: string;
  endTimeStr: string;
  remainingMinutes: number;
  remainingTimeFormatted: string;
}

export interface DialogueTurn {
  speaker: string;
  en: string;
  ko: string;
}

export interface ExpressionItem {
  id?: string;
  category: 'daily' | 'business' | 'travel' | 'pattern';
  expression: string;
  meaning: string;
  nuance: string;
  dialogue: DialogueTurn[];
  similarExpressions?: string[];
  quizQuestion?: {
    sentence: string;
    answer: string;
    options: QuestionOption[];
  };
}

export interface ExpressionCategoryInfo {
  id: 'daily' | 'business' | 'travel' | 'pattern';
  title: string;
  subTitle: string;
  icon: string;
  badge: string;
  gradient: string;
  desc: string;
}

export interface BookmarkItem {
  id: string;
  userName: string;
  sentence: string;
  question: Question;
  createdAt?: any;
  dateStr?: string;
}
