export type StatsProgressColor = {
  progressClassName: string;
  textClassName: string;
};

export type ScoreOption = {
  label: string;
  value: string;
};

export type StatsGridProps = {
  activeDays: number;
  activeDaysTarget?: number;
  allWorkLogs: number;
  monthlyMoodScore: number;
  monthlyProductivityScore: number;
  moodOptions?: ScoreOption[];
  productivityOptions?: ScoreOption[];
};

export const defaultActiveDaysTarget = 22;
