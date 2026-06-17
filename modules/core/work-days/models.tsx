export type WorkDayEventTone =
  | "blue"
  | "green"
  | "amber"
  | "red"
  | "violet"
  | "neutral";

export type WorkDayEvent = {
  id: string;
  date: string;
  title: string;
  time?: string;
  tone: WorkDayEventTone;
};

export type WorkDayCalendarCell = {
  date: Date;
  dayOfMonth: number;
  events: WorkDayEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
  key: string;
};

export const workDayWeekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const workDayEventToneClassNames: Record<WorkDayEventTone, string> = {
  amber:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  blue:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300",
  green:
    "border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300",
  neutral:
    "border-border bg-muted/50 text-foreground dark:bg-muted/30",
  red:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
  violet:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300",
};

export const sampleWorkDayEvents: WorkDayEvent[] = [
  {
    id: "planning",
    date: "2026-06-08",
    title: "Sprint planning",
    time: "09:30 AM",
    tone: "blue",
  },
  {
    id: "review",
    date: "2026-06-11",
    title: "Work log review",
    time: "02:00 PM",
    tone: "green",
  },
  {
    id: "deploy",
    date: "2026-06-16",
    title: "Service deployment",
    time: "05:30 PM",
    tone: "amber",
  },
  {
    id: "retro",
    date: "2026-06-19",
    title: "Retrospective",
    time: "04:00 PM",
    tone: "violet",
  },
  {
    id: "deadline",
    date: "2026-06-24",
    title: "Project deadline",
    tone: "red",
  },
];
