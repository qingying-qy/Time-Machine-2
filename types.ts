
export type ActivityIcon = '🔥' | '📚' | '💻' | '🏃' | '🧘' | '🎨' | '🛌' | '🍱' | '🎮' | '🧹';

export interface Activity {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface TimeLog {
  id: string;
  activityId: string;
  durationMinutes: number;
  timestamp: number; // ms
  note?: string;
}

export interface Goal {
  id: string;
  activityId: string;
  targetMinutes: number;
  period: 'day' | 'week' | 'month';
}

export type ViewType = 'tracker' | 'dashboard' | 'goals' | 'settings';
export type TimeDimension = 'day' | 'week' | 'month' | 'year';
