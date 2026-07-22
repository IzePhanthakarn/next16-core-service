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
    },
    TODOS: {
        INDEX: "/todos",
    },
    TRANSACTIONS: {
        INDEX: "/transactions",
    },
    TRANSPORTATION_EXPENSES: {
        INDEX: "/transportation-expenses",
    },
    SUBSCRIPTIONS: {
        INDEX: "/subscriptions",
    },
    PROJECTS: {
        INDEX: "/projects",
        DETAIL: (projectId: string) => `/projects/${projectId}`,
        KANBAN: (projectId: string) => `/projects/${projectId}/kanban`,
        BACKLOGS: (projectId: string) => `/projects/${projectId}/backlogs`,
        NOTES: (projectId: string) => `/projects/${projectId}/notes`,
        MEMBERS: (projectId: string) => `/projects/${projectId}/members`,
        SETTINGS: (projectId: string) => `/projects/${projectId}/settings`,
    }
}

export default PAGE_ROUTE;
