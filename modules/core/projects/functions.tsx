import { isAxiosError } from "axios";

import PROJECTS_API, { TASKS_API } from "@/constants/api/projects";
import apiClient from "@/lib/api-client";

import type {
  AddProjectMemberInput,
  ApiResponse,
  Board,
  CreateNoteInput,
  CreateProjectInput,
  CreateSprintInput,
  CreateTaskCommentInput,
  CreateTaskInput,
  Kanban,
  Note,
  PaginatedData,
  Project,
  ProjectDetail,
  ProjectMember,
  ProjectMemberFilter,
  Sprint,
  Task,
  TaskComment,
  UpdateNoteInput,
  UpdateProjectInput,
  UpdateSprintInput,
  UpdateTaskInput,
} from "./models";

// ===== Projects =====

export const getProjects = async () => {
  const response = await apiClient.get<ApiResponse<Project[]>>(
    PROJECTS_API.ROOT
  );

  return response.data.data;
};

export const getProject = async (projectId: string) => {
  const response = await apiClient.get<ApiResponse<ProjectDetail>>(
    PROJECTS_API.DETAIL(projectId)
  );

  return response.data.data;
};

export const createProject = async (input: CreateProjectInput) => {
  const response = await apiClient.post<ApiResponse<Project>>(
    PROJECTS_API.ROOT,
    input
  );

  return response.data.data;
};

export const updateProject = async (
  projectId: string,
  input: UpdateProjectInput
) => {
  const response = await apiClient.put<ApiResponse<Project>>(
    PROJECTS_API.DETAIL(projectId),
    input
  );

  return response.data.data;
};

export const deleteProject = async (projectId: string) => {
  await apiClient.delete(PROJECTS_API.DETAIL(projectId));
};

export const addProjectMember = async (
  projectId: string,
  input: AddProjectMemberInput
) => {
  const response = await apiClient.post<ApiResponse<ProjectMember>>(
    PROJECTS_API.MEMBERS(projectId),
    input
  );

  return response.data.data;
};

export const removeProjectMember = async (projectId: string, userId: string) => {
  await apiClient.delete(PROJECTS_API.MEMBER(projectId, userId));
};

export const getProjectMembers = async (
  projectId: string,
  filters: ProjectMemberFilter
) => {
  const response = await apiClient.get<ApiResponse<PaginatedData<ProjectMember>>>(
    PROJECTS_API.MEMBERS(projectId),
    { params: filters }
  );

  return response.data.data;
};

// ===== Notes =====

export const getNotes = async (projectId: string) => {
  const response = await apiClient.get<ApiResponse<Note[]>>(
    PROJECTS_API.NOTES(projectId)
  );

  return response.data.data;
};

export const createNote = async (projectId: string, input: CreateNoteInput) => {
  const response = await apiClient.post<ApiResponse<Note>>(
    PROJECTS_API.NOTES(projectId),
    input
  );

  return response.data.data;
};

export const updateNote = async (
  projectId: string,
  noteId: string,
  input: UpdateNoteInput
) => {
  const response = await apiClient.put<ApiResponse<Note>>(
    PROJECTS_API.NOTE(projectId, noteId),
    input
  );

  return response.data.data;
};

export const deleteNote = async (projectId: string, noteId: string) => {
  await apiClient.delete(PROJECTS_API.NOTE(projectId, noteId));
};

// ===== Boards, Kanban & Backlogs =====

export const getBoards = async (projectId: string) => {
  const response = await apiClient.get<ApiResponse<Board[]>>(
    PROJECTS_API.BOARDS(projectId)
  );

  return response.data.data;
};

export const getKanban = async (projectId: string) => {
  const response = await apiClient.get<ApiResponse<Kanban>>(
    PROJECTS_API.KANBAN(projectId)
  );

  return response.data.data;
};

export const getBacklogs = async (projectId: string) => {
  const response = await apiClient.get<ApiResponse<Task[]>>(
    PROJECTS_API.BACKLOGS(projectId)
  );

  return response.data.data;
};

// ===== Sprints =====

export const getSprints = async (projectId: string) => {
  const response = await apiClient.get<ApiResponse<Sprint[]>>(
    PROJECTS_API.SPRINTS(projectId)
  );

  return response.data.data;
};

export const createSprint = async (
  projectId: string,
  input: CreateSprintInput
) => {
  const response = await apiClient.post<ApiResponse<Sprint>>(
    PROJECTS_API.SPRINTS(projectId),
    input
  );

  return response.data.data;
};

export const updateSprint = async (
  projectId: string,
  sprintId: string,
  input: UpdateSprintInput
) => {
  const response = await apiClient.put<ApiResponse<Sprint>>(
    PROJECTS_API.SPRINT(projectId, sprintId),
    input
  );

  return response.data.data;
};

export const deleteSprint = async (projectId: string, sprintId: string) => {
  await apiClient.delete(PROJECTS_API.SPRINT(projectId, sprintId));
};

export const getSprintTasks = async (projectId: string, sprintId: string) => {
  const response = await apiClient.get<ApiResponse<Task[]>>(
    PROJECTS_API.SPRINT_TASKS(projectId, sprintId)
  );

  return response.data.data;
};

// ===== Tasks =====

export const createTask = async (input: CreateTaskInput) => {
  const response = await apiClient.post<ApiResponse<Task>>(
    TASKS_API.ROOT,
    input
  );

  return response.data.data;
};

export const updateTask = async (taskId: string, input: UpdateTaskInput) => {
  const response = await apiClient.put<ApiResponse<Task>>(
    TASKS_API.DETAIL(taskId),
    input
  );

  return response.data.data;
};

export const deleteTask = async (taskId: string) => {
  await apiClient.delete(TASKS_API.DETAIL(taskId));
};

export const getTaskComments = async (taskId: string) => {
  const response = await apiClient.get<ApiResponse<TaskComment[]>>(
    TASKS_API.COMMENTS(taskId)
  );

  return response.data.data;
};

export const createTaskComment = async (
  taskId: string,
  input: CreateTaskCommentInput
) => {
  const response = await apiClient.post<ApiResponse<TaskComment>>(
    TASKS_API.COMMENTS(taskId),
    input
  );

  return response.data.data;
};

export const getProjectErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong with the project request.";
};
