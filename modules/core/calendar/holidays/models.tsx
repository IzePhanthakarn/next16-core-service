export type Holiday = {
  id: string;
  holiday_description: string;
  holiday_date: string;
  holiday_year: string;
};

export type UpcomingHoliday = {
  holiday_description: string;
  holiday_date: string;
  days_until: number;
};

export type HolidayStats = {
  total_holidays_this_year: number;
  total_holidays_this_month: number;
  next_upcoming_holiday: UpcomingHoliday | null;
  remaining_holidays_this_year: number;
};

export type HolidayData = {
  items: Holiday[];
  stats: HolidayStats;
};

export type HolidayResponse = {
  status: string;
  code: number;
  message: string;
  data: HolidayData;
};
