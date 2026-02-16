
export enum MeetingStatus {
  SCHEDULED = 'Scheduled',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export interface Meeting {
  id: string;
  fairId: string;
  contactName: string;
  company: string;
  time: string;
  location: string;
  previousTalks: string;
  goals: string;
  status: MeetingStatus;
  aiInsights?: string;
}

export interface TradeFair {
  id: string;
  name: string;
  url: string;
  date: string;
  location: string;
  description: string;
  meetings: Meeting[];
  groundingSources?: { title: string; uri: string }[];
}

export interface AIPrepResult {
  summary: string;
  suggestedQuestions: string[];
}
