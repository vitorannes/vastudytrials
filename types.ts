export interface StudySession {
  id: number;
  subject: string;
  duration: number; // in seconds
  date: string; // ISO string
  type: 'theory' | 'exercises';
  user_id?: string;
}

export interface QuestionsLog {
  id: number;
  subject: string;
  total: number;
  correct: number;
  wrong: number;
  date: string; // ISO string
  user_id?: string;
}

export type Theme = 'light' | 'dark';

export interface AppData {
  sessions: StudySession[];
  logs: QuestionsLog[];
  subjects: string[];
  lastUpdate: number;
}