export type WorkLogTag = {
  log_id: string;
  work_tag: string;
};

export type WorkLog = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood_score: number;
  productivity_score: number;
  tags: WorkLogTag[];
  is_draft: boolean;
  date_logged: string;
  created_at: string;
  updated_at: string;
};

export type WorkLogsData = {
  items: WorkLog[];
  total_items: number;
  total_pages: number;
  current_page: number;
};

export type WorkLogsResponse = {
  status: string;
  code: number;
  message: string;
  data: WorkLogsData;
};

export type WorkLogsQuery = {
  page?: number;
  limit?: number;
  title?: string;
  month?: string;
  year?: string;
};

export const emptyWorkLogs: WorkLogsData = {
  items: [],
  total_items: 0,
  total_pages: 1,
  current_page: 1,
};

export const itemPerPageOptions = [10, 20, 31] as const;
