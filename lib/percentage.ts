export const getPercentage = (value: number, total: number) => {
  if (total <= 0) {
    return 0;
  }

  return Math.round(Math.min((value / total) * 100, 100));
};
