/**
 * Shared domain types for the Project Management feature.
 *
 * These mirror the rust-core-service API responses/requests and are consumed
 * across every projects sub-module (list, detail, kanban, backlogs, notes,
 * settings).
 */

export type ApiResponse<T> = {
  status: string;
  code: number;
  message: string;
  data: T;
};

export type PaginatedData<T> = {
  items: T[];
  total_items: number;
  total_pages: number;
  current_page: number;
};

export type ProjectStatus = "planning" | "active" | "completed" | "on_hold";

export type ProjectMember = {
  user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  joined_at: string;
};

/** Shape returned by the list endpoint (`GET /projects`). */
export type Project = {
  id: string;
  title: string;
  description: string;
  owner_id: string;
  status: ProjectStatus;
  start_date: string;
  finish_date: string | null;
  member_count: number;
  created_at: string;
  updated_at: string;
};

/** Shape returned by the detail endpoint (`GET /projects/{id}`). */
export type ProjectDetail = {
  id: string;
  title: string;
  description: string;
  owner_id: string;
  status: ProjectStatus;
  start_date: string;
  finish_date: string | null;
  created_at: string;
  updated_at: string;
  members: ProjectMember[];
};

export type NoteType = "folder" | "file";

/** Notes come back as a nested tree via `children`. */
export type Note = {
  id: string;
  project_id: string;
  parent_id: string | null;
  type: NoteType;
  title: string;
  content: string | null;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  children: Note[];
};

export type BoardColumn = {
  id: string;
  name: string;
  order_index: number;
};

export type Board = {
  id: string;
  project_id: string;
  name: string;
  columns: BoardColumn[];
};

export type Sprint = {
  id: string;
  project_id: string;
  name: string;
  goal: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
};

export type TaskType = "epic" | "story" | "task" | "bug";

export type TaskPriority = "lowest" | "low" | "medium" | "high" | "highest";

export type TaskAssignee = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
};

export type Task = {
  id: string;
  project_id: string;
  board_id: string;
  sprint_id: string | null;
  column_id: string;
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  story_points: number | null;
  assignee_id: string | null;
  assignee: TaskAssignee | null;
  reporter_id: string;
  tag: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskComment = {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type KanbanColumn = {
  id: string;
  name: string;
  order_index: number;
  tasks: Task[];
};

export type Kanban = {
  board_id: string;
  board_name: string;
  active_sprint: Sprint | null;
  columns: KanbanColumn[];
};

// ===== Request payloads =====

export type CreateProjectInput = {
  title: string;
  description: string;
  status?: ProjectStatus;
  start_date: string;
  finish_date?: string | null;
};

export type UpdateProjectInput = {
  title: string;
  description: string;
  status: ProjectStatus;
  start_date: string;
  finish_date?: string | null;
};

export type AddProjectMemberInput = {
  email: string;
};

export type ProjectMemberFilter = {
  page: number;
  limit: number;
  first_name?: string;
  last_name?: string;
  email?: string;
};

export type CreateNoteInput = {
  parent_id?: string | null;
  type: NoteType;
  title: string;
  content?: string | null;
};

export type UpdateNoteInput = {
  title: string;
  content?: string | null;
};

export type CreateSprintInput = {
  name: string;
  goal?: string | null;
  start_date: string;
  end_date?: string | null;
};

export type UpdateSprintInput = Partial<{
  name: string;
  goal: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
}>;

export type CreateTaskInput = {
  project_id: string;
  sprint_id?: string | null;
  column_id?: string | null;
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  story_points?: number | null;
  assignee_id?: string | null;
  tag?: string | null;
};

export type UpdateTaskInput = Partial<{
  title: string;
  description: string;
  column_id: string;
  type: TaskType;
  priority: TaskPriority;
  story_points: number | null;
  sprint_id: string | null;
  assignee_id: string | null;
  tag: string | null;
}>;

export type CreateTaskCommentInput = {
  content: string;
};
