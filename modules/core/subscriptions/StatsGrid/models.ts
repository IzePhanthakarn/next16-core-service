import type { SubscriptionStats } from "../models";

export type SubscriptionStatsGridProps = {
  stats: SubscriptionStats;
};

// How many category segments to render before collapsing the rest into "Other".
export const categoryBreakdownLimit = 4;
