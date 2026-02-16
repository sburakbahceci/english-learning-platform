export interface Level {
  id: string;
  code: string;
  name: string;
  description: string;
  orderIndex: number;
  requiredXp: number;
  badgeIconUrl: string | null;
  createdAt?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
  createdAt?: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  levelId: string;
  status: 'locked' | 'in_progress' | 'completed';
  lessonsCompleted: number;
  totalLessons: number;
  isExamUnlocked: boolean;
  examPassed: boolean;
  bestExamScore: number;
  level?: {
    code: string;
    name: string;
  };
}

export interface Achievement {
  code: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  xpReward: number;
}

// YENİ LESSON TYPES
export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  type: 'grammar' | 'vocabulary' | 'practice';
  orderIndex: number;
  xpReward: number;
  estimatedMinutes: number;
}

export interface LessonDetail extends Lesson {
  content: LessonContent;
  level: {
    code: string;
    name: string;
  };
}

export interface LessonContent {
  introduction: string;
  rules?: string[];
  examples?: string[];
  words?: VocabularyWord[];
  tasks?: string[];
  exercises: Exercise[];
}

export interface VocabularyWord {
  word: string;
  definition: string;
  example: string;
  translation?: string;
}

export interface Exercise {
  question: string;
  answer: string;
  options?: string[];
  type?: 'multiple_choice' | 'writing';
  prompt?: string;
  minWords?: number;
}

export interface LessonCompletion {
  lessonId: string;
  score: number | null;
  xpEarned: number | null;
  completedAt: string;
}

export interface CompleteLessonResult {
  completion: LessonCompletion;
  xpEarned: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}
