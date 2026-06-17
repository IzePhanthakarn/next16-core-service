const WORK_DAYS_BASE_PATH = "/work-days";

const WORK_DAYS_API = {
    HOLIDAYS: `${WORK_DAYS_BASE_PATH}/holidays`,
    HOLIDAY_FETCH: `${WORK_DAYS_BASE_PATH}/holiday-fetch`,
} as const;

export default WORK_DAYS_API;
