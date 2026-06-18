export type CalendarEventTag =
  | "blue"
  | "coral"
  | "gray"
  | "mint"
  | "crimson"
  | "purple"
  | "terracotta"
  | "amber";

export type CalendarEvent = {
  id: string;
  date: string;
  description?: string;
  end_date?: string;
  start_date?: string;
  title: string;
  time?: string;
  tag: CalendarEventTag;
  user_id?: string;
};

export type CalendarEventsData = {
  items: CalendarEvent[];
  total_events: number;
};

export type CalendarEventsResponse = {
  status: string;
  code: number;
  message: string;
  data: CalendarEventsData;
};

export type CalendarEventsQuery = {
  month?: number;
  tag?: CalendarEventTag;
  year?: number;
};

export type CalendarCell = {
  date: Date;
  dayOfMonth: number;
  events: CalendarEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
  key: string;
};

export const calendarWeekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const calendarEventTagClassNames: Record<CalendarEventTag, string> = {
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

export const calendarEventTagOptions: {
  label: string;
  value: CalendarEventTag;
}[] = [
  { label: "Meeting", value: "blue" },
  { label: "Personal Leave", value: "gray" },
  { label: "Onsite Travel", value: "mint" },
  { label: "Deployment", value: "crimson" },
  { label: "Code Review", value: "purple" },
  { label: "Deep Work", value: "terracotta" },
  { label: "Server Maintenance", value: "amber" },
  { label: "Public Holidays", value: "coral" },
];

// 1. Meeting (ประชุมทั่วไป/คุยงาน): สีฟ้า (Blue)
// 2. Public Holidays (วันหยุดนักขัตฤกษ์): สีแดงอมชมพู (Coral )
// 3. Personal Leave (วันหยุดที่เราลาเอง/ลาป่วย/ลาพักร้อน): สีเทา(Gray)
// 4. Onsite Travel (วันเดินทางไปออฟฟิศ/พบลูกค้า): สีมินต์ (Mint)
// 5. Deployment / Release Production: สีแดงเบอร์กันดี (Crimson)
// 6. Code Review / Pair Programming: สีม่วง (Purple)
// 7. Focus Time / Deep Work: สีส้มอิฐ (Terracotta)
// 8. Incidents / Server Maintenance: สีเหลืองมัสตาร์ด (Amber)

export const emptyCalendarEvents: CalendarEventsData = {
  items: [],
  total_events: 0,
};
