export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  last_login?: string;
  created_at: string;
}

export interface AdminLoginResponse {
  token: string;
  admin: AdminUser;
}

export interface DashboardStats {
  users: {
    total: number;
    active: number;
  };
  lessons: {
    completions: number;
  };
  xp: {
    total: number;
  };
  placementTests: {
    completed: number;
  };
  content: {
    podcasts: number;
    readingPassages: number;
    writingPrompts: number;
    speakingTasks: number;
  };
}

export interface LevelStats {
  code: string;
  name: string;
  content: {
    lessons: number;
    podcasts: number;
    readingPassages: number;
    writingPrompts: number;
    speakingTasks: number;
  };
}

export interface Activity {
  type: string;
  user: string;
  action: string;
  level?: string;
  timestamp: string;
}

export interface UserGrowth {
  date: string;
  users: number;
}

export interface TopUser {
  id: string;
  name: string;
  email: string;
  total_xp: number;
  current_streak: number;
  starting_level?: string;
}
