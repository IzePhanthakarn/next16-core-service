const PAGE_ROUTE = {
    DASHBOARD: "/dashboard",
    WORK_LOGS: {
        INDEX: "/work-logs",
        STATS: "/work-logs/stats"
    },
    WORK_DAYS: {
        INDEX: "/work-days",
        HOLIDAY: "/work-days/holidays"
    },
    PROPERTIES: {
        INDEX: "/properties",
        DETAIL: (propertyId: string) => `/properties/${propertyId}`,
    }
}

export default PAGE_ROUTE;
