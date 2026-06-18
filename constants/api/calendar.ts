const CALENDAR_BASE_PATH = "/calendar";

const CALENDAR_API = {
    EVENTS: `${CALENDAR_BASE_PATH}/events`,
    HOLIDAYS: `${CALENDAR_BASE_PATH}/holidays`,
    HOLIDAY_FETCH: `${CALENDAR_BASE_PATH}/holiday-fetch`,
} as const;

export default CALENDAR_API;
