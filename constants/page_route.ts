const PAGE_ROUTE = {
    DASHBOARD: "/dashboard",
    WORK_LOGS: {
        INDEX: "/work-logs",
        STATS: "/work-logs/stats"
    },
    CALENDAR: {
        INDEX: "/calendar",
        HOLIDAY: "/calendar/holidays"
    },
    PROPERTIES: {
        INDEX: "/properties",
        DETAIL: (propertyId: string) => `/properties/${propertyId}`,
    }
}

export default PAGE_ROUTE;
