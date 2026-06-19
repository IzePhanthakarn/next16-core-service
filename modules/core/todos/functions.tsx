import { isAxiosError } from "axios";

import TODOS_API from "@/constants/api/todos";
import apiClient from "@/lib/api-client";

import {
  type CreateTodoItemInput,
  type CreateTodoListInput,
  type TodoItem,
  type TodoItemResponse,
  type TodoItemsResponse,
  type TodoListResponse,
  type TodoListsResponse,
} from "./models";

export const getTodoLists = async () => {
  const response = await apiClient.get<TodoListsResponse>(TODOS_API.LISTS);

  return response.data.data;
};

export const createTodoList = async (input: CreateTodoListInput) => {
  const response = await apiClient.post<TodoListResponse>(
    TODOS_API.LISTS,
    input
  );

  return response.data.data;
};

export const updateTodoList = async (
  listId: string,
  input: CreateTodoListInput
) => {
  const response = await apiClient.put<TodoListResponse>(
    TODOS_API.LIST(listId),
    input
  );

  return response.data.data;
};

export const moveTodoListToTop = async (listId: string) => {
  const response = await apiClient.patch<TodoListsResponse>(
    TODOS_API.MOVE_LIST_TO_TOP(listId)
  );

  return response.data.data;
};

export const deleteTodoList = async (listId: string) => {
  await apiClient.delete(TODOS_API.LIST(listId));
};

export const createTodoItem = async (
  listId: string,
  input: CreateTodoItemInput
) => {
  const response = await apiClient.post<TodoItemResponse>(
    TODOS_API.ITEMS(listId),
    input
  );

  return response.data.data;
};

export const toggleTodoItem = async (itemId: string) => {
  const response = await apiClient.patch<TodoItemResponse>(
    TODOS_API.TOGGLE_ITEM(itemId)
  );

  return response.data.data;
};

export const reorderTodoItems = async (listId: string, itemIds: string[]) => {
  const response = await apiClient.patch<TodoItemsResponse>(
    TODOS_API.REORDER_ITEMS(listId),
    { item_ids: itemIds }
  );

  return response.data.data;
};

export const deleteTodoItem = async (itemId: string) => {
  await apiClient.delete(TODOS_API.ITEM(itemId));
};

/**
 * Returns the list's item ids ordered with incomplete items first and completed
 * items at the bottom, applying the pending toggle of `toggledItemId` locally so
 * the freshly completed item sinks to the bottom (and a re-opened one rises).
 */
export const buildReorderedItemIds = (
  items: TodoItem[],
  toggledItemId: string
) => {
  const withToggle = items.map((item) =>
    item.id === toggledItemId
      ? { ...item, is_completed: !item.is_completed }
      : item
  );
  const byPosition = [...withToggle].sort((a, b) => a.position - b.position);

  return [
    ...byPosition.filter((item) => !item.is_completed),
    ...byPosition.filter((item) => item.is_completed),
  ].map((item) => item.id);
};

export const getTodosErrorMessage = (error: unknown) => {
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

  return "Failed to load todo lists.";
};
