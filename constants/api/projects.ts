const PROJECTS_BASE_PATH = "/projects";
const TASKS_BASE_PATH = "/tasks";

const PROJECTS_API = {
    ROOT: PROJECTS_BASE_PATH,
    DETAIL: (projectId: string) => `${PROJECTS_BASE_PATH}/${projectId}`,
    MEMBERS: (projectId: string) => `${PROJECTS_BASE_PATH}/${projectId}/members`,
    MEMBER: (projectId: string, userId: string) =>
        `${PROJECTS_BASE_PATH}/${projectId}/members/${userId}`,

    // Notes (backend returns a nested tree; update/delete are project-scoped)
    NOTES: (projectId: string) => `${PROJECTS_BASE_PATH}/${projectId}/notes`,
    NOTE: (projectId: string, noteId: string) =>
        `${PROJECTS_BASE_PATH}/${projectId}/notes/${noteId}`,

    // Boards, Kanban & Backlogs
    BOARDS: (projectId: string) => `${PROJECTS_BASE_PATH}/${projectId}/boards`,
    KANBAN: (projectId: string) => `${PROJECTS_BASE_PATH}/${projectId}/kanban`,
    BACKLOGS: (projectId: string) =>
        `${PROJECTS_BASE_PATH}/${projectId}/backlogs`,

    // Sprints
    SPRINTS: (projectId: string) => `${PROJECTS_BASE_PATH}/${projectId}/sprints`,
    SPRINT: (projectId: string, sprintId: string) =>
        `${PROJECTS_BASE_PATH}/${projectId}/sprints/${sprintId}`,
    SPRINT_TASKS: (projectId: string, sprintId: string) =>
        `${PROJECTS_BASE_PATH}/${projectId}/sprints/${sprintId}/tasks`,
} as const;

export const TASKS_API = {
    ROOT: TASKS_BASE_PATH,
    DETAIL: (taskId: string) => `${TASKS_BASE_PATH}/${taskId}`,
    COMMENTS: (taskId: string) => `${TASKS_BASE_PATH}/${taskId}/comments`,
} as const;

export default PROJECTS_API;
