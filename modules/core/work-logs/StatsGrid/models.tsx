export type StatsProgressColor = {
  progressClassName: string;
  textClassName: string;
};

export type StatsGridProps = {
  activeDays: number;
  activeDaysTarget?: number;
  allWorkLogs: number;
  monthlyMoodScore: number;
  monthlyProductivityScore: number;
};

export const defaultActiveDaysTarget = 22;
