import type { StatsProgressColor } from "./models";

type ScoreOption = {
  label: string;
  value: string;
};

export const getStatsProgressValue = (value: number, target: number) => {
  if (target <= 0) {
    return 0;
  }

  return Math.round(Math.min((value / target) * 100, 100));
};

export const getScoreProgressValue = (score: number) =>
  getStatsProgressValue(score, 5);

export const getScoreLabel = (score: number, options: ScoreOption[]) => {
  const optionValue = Math.min(Math.max(Math.floor(score), 1), 5).toString();

  return (
    options.find((option) => option.value === optionValue)?.label ??
    options[0]?.label ??
    ""
  );
};

export const formatScore = (score: number) => `${score}/5`;

export const getStatsProgressColor = (value: number): StatsProgressColor => {
  if (value >= 85) {
    return {
      progressClassName: "[&_[data-slot=progress-indicator]]:bg-blue-500",
      textClassName: "text-blue-600 dark:text-blue-400",
    };
  }

  if (value >= 70) {
    return {
      progressClassName: "[&_[data-slot=progress-indicator]]:bg-green-500",
      textClassName: "text-green-600 dark:text-green-400",
    };
  }

  if (value >= 50) {
    return {
      progressClassName: "[&_[data-slot=progress-indicator]]:bg-white",
      textClassName: "text-white",
    };
  }

  if (value >= 30) {
    return {
      progressClassName: "[&_[data-slot=progress-indicator]]:bg-yellow-500",
      textClassName: "text-yellow-600 dark:text-yellow-400",
    };
  }
  if (value >= 1) {
    return {
      progressClassName: "[&_[data-slot=progress-indicator]]:bg-primary",
      textClassName: "text-primary",
    };
  }

  return {
    progressClassName: "[&_[data-slot=progress-indicator]]:bg-card",
    textClassName: "",
  }
};
