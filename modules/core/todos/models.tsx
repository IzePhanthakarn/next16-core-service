export type TodoItem = {
  id: string;
  list_id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  due_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export type TodoList = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  color: string | null;
  items: TodoItem[];
  created_at: string;
  updated_at: string;
};

export type TodoListsResponse = {
  status: string;
  code: number;
  message: string;
  data: TodoList[];
};

export type TodoListResponse = {
  status: string;
  code: number;
  message: string;
  data: TodoList;
};

export type TodoItemResponse = {
  status: string;
  code: number;
  message: string;
  data: TodoItem;
};

export type TodoItemsResponse = {
  status: string;
  code: number;
  message: string;
  data: TodoItem[];
};

export type CreateTodoListInput = {
  title: string;
  description?: string;
  color?: string;
};

export type CreateTodoItemInput = {
  title: string;
  description?: string;
  due_date?: string;
};
