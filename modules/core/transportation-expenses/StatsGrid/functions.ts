const chartColors = [
  "#f43f5e",
  "#3b82f6",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
  "#06b6d4",
] as const;

export const getChartColor = (index: number) =>
  chartColors[index % chartColors.length];

export const getCategorySplitGradient = (
  categorySplit: { percentage: number }[],
) => {
  let start = 0;

  const segments = categorySplit.map((category, index) => {
    const percentage = Math.max(category.percentage, 0);
    const end = Math.min(start + percentage, 100);
    const segment = `${getChartColor(index)} ${start}% ${end}%`;

    start = end;

    return segment;
  });

  return `conic-gradient(${segments.join(", ")})`;
};

export const formatPercentage = (percentage: number) =>
  new Intl.NumberFormat("en-EN", {
    maximumFractionDigits: 1,
  }).format(percentage);
