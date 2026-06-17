export type WorkDayEventTone =
  | "blue"
  | "coral"
  | "gray"
  | "mint"
  | "crimson"
  | "purple"
  | "terracotta"
  | "amber";

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
  coral:
    "border-[#f7b4a8] bg-[#fff1ed] text-[#b84433] dark:border-[#ff7f6e]/30 dark:bg-[#ff7f6e]/10 dark:text-[#ffb4a8]",
  crimson:
    "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-600/35 dark:bg-rose-700/15 dark:text-rose-300",
  gray:
    "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-500/30 dark:bg-gray-500/10 dark:text-gray-300",
  mint:
    "border-[#a7f3d0] bg-[#ecfdf5] text-[#047857] dark:border-[#34d399]/30 dark:bg-[#34d399]/10 dark:text-[#6ee7b7]",
  purple:
    "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300",
  terracotta:
    "border-[#f1b08a] bg-[#fff3eb] text-[#a54518] dark:border-[#c65f2d]/35 dark:bg-[#c65f2d]/15 dark:text-[#f1b08a]",
};

// 1. Meeting (ประชุมทั่วไป/คุยงาน): สีฟ้า (Blue)
// 2. Public Holidays (วันหยุดนักขัตฤกษ์): สีแดงอมชมพู (Coral )
// 3. Personal Leave (วันหยุดที่เราลาเอง/ลาป่วย/ลาพักร้อน): สีเทา(Gray)
// 4. Onsite Travel (วันเดินทางไปออฟฟิศ/พบลูกค้า): สีมินต์ (Mint)
// 5. Deployment / Release Production: สีแดงเบอร์กันดี (Crimson)
// 6. Code Review / Pair Programming: สีม่วง (Purple)
// 7. Focus Time / Deep Work: สีส้มอิฐ (Terracotta)
// 8. Incidents / Server Maintenance: สีเหลืองมัสตาร์ด (Amber)

export const sampleWorkDayEvents: WorkDayEvent[] = [
  {
    id: "planning",
    date: "2026-06-08",
    title: "Sprint planning",
    time: "09:30 AM",
    tone: "blue",
  },
  {
    id: "planning",
    date: "2026-06-08",
    title: "Sprint planning",
    time: "10:30 AM",
    tone: "coral",
  },
  {
    id: "review",
    date: "2026-06-11",
    title: "Work log review",
    time: "02:00 PM",
    tone: "purple",
  },
  {
    id: "deploy",
    date: "2026-06-16",
    title: "Service deployment",
    time: "05:30 PM",
    tone: "crimson",
  },
  {
    id: "retro",
    date: "2026-06-19",
    title: "Retrospective",
    time: "04:00 PM",
    tone: "terracotta",
  },
  {
    id: "deadline",
    date: "2026-06-24",
    title: "Project deadline",
    tone: "coral",
  },
];
