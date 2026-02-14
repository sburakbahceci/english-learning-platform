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
