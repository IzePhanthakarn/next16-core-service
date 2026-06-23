"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  ArrowRight,
  CircleDashed,
  FilePenLine,
  ListTodo,
  PlayCircle,
  SquareCheckBig,
} from "lucide-react";

import { LineMdLoadingLoop } from "@/assets/icons/LineMdLoadingLoop";
import { LucideTimer } from "@/assets/icons/LucideTimer";
import { UilPen } from "@/assets/icons/UilPen";
import { UilPlusCircle } from "@/assets/icons/UilPlusCircle";
import { UilTrashAlt } from "@/assets/icons/UilTrashAlt";
import { DeleteConfirmDialog } from "@/components/dialogs/delete-confirm-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { appToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import {
  deleteSprint,
  deleteTask,
  getBacklogs,
  getBoards,
  getProject,
  getProjectErrorMessage,
  getSprintTasks,
  getSprints,
  updateSprint,
  updateTask,
} from "../functions";
import type { BoardColumn, ProjectDetail, Sprint, Task } from "../models";
import { PRIORITY_CONFIG, TYPE_CONFIG } from "../taskMeta";
import { CreateTaskSheet } from "./CreateTaskSheet";
import { SprintSheet } from "./SprintSheet";

const formatSprintRange = (sprint: Sprint) => {
  const parts = [sprint.start_date, sprint.end_date]
    .filter((value): value is string => Boolean(value))
    .map((value) => {
      const date = new Date(value);

      return Number.isNaN(date.getTime()) ? value : format(date, "d MMM yyyy");
    });

  return parts.join(" – ");
};

const canAddTaskToSprint = (sprint: Sprint) => {
  if (!sprint.end_date) {
    return true;
  }

  const endDate = new Date(sprint.end_date);
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return !Number.isNaN(endDate.getTime()) && endDate >= today;
};

const getAssigneeName = (task: Task) =>
  [task.assignee?.first_name, task.assignee?.last_name]
    .filter((name): name is string => Boolean(name?.trim()))
    .join(" ");

const getAssigneeInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const useBacklogs = (projectId: string) => {
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [sprintTasks, setSprintTasks] = useState<Record<string, Task[]>>({});
  const [backlogTasks, setBacklogTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const reload = () => setReloadKey((value) => value + 1);

  useEffect(() => {
    const loadBacklogs = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [projectDetail, boards, sprintList, backlog] = await Promise.all([
          getProject(projectId),
          getBoards(projectId),
          getSprints(projectId),
          getBacklogs(projectId),
        ]);
        const taskLists = await Promise.all(
          sprintList.map(async (sprint) => [
            sprint.id,
            await getSprintTasks(projectId, sprint.id),
          ] as const)
        );

        const board = boards[0] ?? null;
        const sortedColumns = [...(board?.columns ?? [])].sort(
          (first, second) => first.order_index - second.order_index
        );

        setColumns(sortedColumns);
        setProject(projectDetail);
        setSprints(sprintList);
        setSprintTasks(Object.fromEntries(taskLists));
        setBacklogTasks(backlog);
      } catch (error) {
        setErrorMessage(getProjectErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    void loadBacklogs();
  }, [projectId, reloadKey]);

  return {
    backlogTasks,
    columns,
    errorMessage,
    isLoading,
    project,
    reload,
    sprints,
    sprintTasks,
  };
};

type BacklogTaskRowProps = {
  task: Task;
  columns: BoardColumn[];
  projectId: string;
  sprints: Sprint[];
  availableSprints: Sprint[];
  isMoving: boolean;
  onDelete: (task: Task) => Promise<void>;
  onAddToSprint: (task: Task, sprint: Sprint) => void;
  onReload: () => void;
};

const BacklogTaskRow = ({
  task,
  columns,
  projectId,
  sprints,
  availableSprints,
  isMoving,
  onDelete,
  onAddToSprint,
  onReload,
}: BacklogTaskRowProps) => {
  const priority = PRIORITY_CONFIG[task.priority];
  const type = TYPE_CONFIG[task.type];
  const PriorityIcon = priority.icon;
  const TypeIcon = type.icon;

  return (
    <li className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40">
      <PriorityIcon
        aria-label={`${priority.label} priority`}
        className={cn("size-4 shrink-0", priority.className)}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium" title={task.title}>
          {task.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <Badge className={cn("gap-1 border-transparent", type.className)}>
            <TypeIcon aria-hidden="true" className="size-3" />
            {type.label}
          </Badge>
          {task.tag?.trim() ? (
            <Badge variant="outline">{task.tag}</Badge>
          ) : null}
          {typeof task.story_points === "number" ? (
            <Badge variant="secondary">{task.story_points} pts</Badge>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <CreateTaskSheet
          columns={columns}
          onCreated={onReload}
          projectId={projectId}
          sprints={sprints}
          task={task}
          trigger={
            <Button
              aria-label={`Edit ${task.title}`}
              size="icon-sm"
              type="button"
              variant="warning"
            >
              <UilPen aria-hidden="true" />
            </Button>
          }
        />
        <DeleteConfirmDialog
          ariaLabel={`Delete ${task.title}`}
          onConfirm={() => onDelete(task)}
          title="Delete task"
        >
          Are you sure you want to delete &quot;{task.title}&quot;? This action cannot be undone.
        </DeleteConfirmDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label={`Move ${task.title} to sprint`}
              disabled={availableSprints.length === 0}
              isLoading={isMoving}
              size="sm"
              type="button"
              variant="success"
            >
              <ArrowRight aria-hidden="true" data-icon="inline-start" />
              To sprint
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Select sprint</DropdownMenuLabel>
            {availableSprints.map((sprint) => (
              <DropdownMenuItem
                key={sprint.id}
                onSelect={() => onAddToSprint(task, sprint)}
              >
                {sprint.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
};

type ProjectBacklogsPageProps = {
  currentUserId: string;
  projectId: string;
};

export const ProjectBacklogsPage = ({
  currentUserId,
  projectId,
}: ProjectBacklogsPageProps) => {
  const {
    backlogTasks,
    columns,
    errorMessage,
    isLoading,
    project,
    reload,
    sprints,
    sprintTasks,
  } = useBacklogs(projectId);

  const [movingTaskId, setMovingTaskId] = useState<string | null>(null);
  const [actioningSprintId, setActioningSprintId] = useState<string | null>(
    null
  );

  const activeSprint = sprints.find((sprint) => sprint.is_active) ?? null;
  const availableSprints = sprints.filter(canAddTaskToSprint);
  const isCurrentUserOwner = project?.owner_id === currentUserId;

  const handleAddToSprint = async (task: Task, sprint: Sprint) => {
    setMovingTaskId(task.id);

    try {
      await updateTask(task.id, { sprint_id: sprint.id });
      appToast.success(`Task moved to ${sprint.name}.`);
      reload();
    } catch (error) {
      appToast.error(getProjectErrorMessage(error));
    } finally {
      setMovingTaskId(null);
    }
  };

  const handleDeleteTask = async (task: Task) => {
    try {
      await deleteTask(task.id);
      appToast.success("Task deleted.");
      reload();
    } catch (error) {
      appToast.error(getProjectErrorMessage(error));
      throw error;
    }
  };

  const handleToggleSprint = async (sprint: Sprint) => {
    setActioningSprintId(sprint.id);

    try {
      await updateSprint(projectId, sprint.id, { is_active: !sprint.is_active });
      appToast.success(
        sprint.is_active ? `${sprint.name} closed.` : `${sprint.name} started.`
      );
      reload();
    } catch (error) {
      appToast.error(getProjectErrorMessage(error));
    } finally {
      setActioningSprintId(null);
    }
  };

  const handleDeleteSprint = async (sprint: Sprint) => {
    try {
      await deleteSprint(projectId, sprint.id);
      appToast.success(`${sprint.name} deleted.`);
      reload();
    } catch (error) {
      appToast.error(getProjectErrorMessage(error));
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[440px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/20 text-sm text-muted-foreground">
        <LineMdLoadingLoop className="h-10 w-10 text-primary" />
        Loading backlog...
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex h-[440px] flex-col items-center justify-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-6 text-center text-sm text-destructive">
        <CircleDashed aria-hidden="true" className="size-8" />
        <p>{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <ListTodo aria-hidden="true" className="size-4 text-muted-foreground" />
            <div>
              <h2 className="text-sm font-semibold">Backlog</h2>
              <p className="text-xs text-muted-foreground">
                {backlogTasks.length} task{backlogTasks.length === 1 ? "" : "s"}
                {activeSprint
                  ? ` · active sprint: ${activeSprint.name}`
                  : " · no active sprint"}
              </p>
            </div>
          </div>
          <CreateTaskSheet
            onCreated={reload}
            projectId={projectId}
            trigger={
              <Button className="font-medium" size="sm" type="button" variant="success">
                <UilPlusCircle aria-hidden="true" data-icon="inline-start" />
                New task
              </Button>
            }
          />
        </div>

        {backlogTasks.length === 0 ? (
          <div className="flex h-28 flex-col items-center justify-center gap-1 text-center text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Backlog is empty</p>
            <p>Add a task to start planning your next sprint.</p>
          </div>
        ) : (
          <ul className="divide-y">
            {backlogTasks.map((task) => (
              <BacklogTaskRow
                availableSprints={availableSprints}
                columns={columns}
                isMoving={movingTaskId === task.id}
                key={task.id}
                onAddToSprint={handleAddToSprint}
                onDelete={handleDeleteTask}
                onReload={reload}
                projectId={projectId}
                sprints={sprints}
                task={task}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <LucideTimer aria-hidden="true" className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Sprints</h2>
          </div>
          <SprintSheet
            onSaved={reload}
            projectId={projectId}
            trigger={
              <Button className="font-medium" size="sm" type="button" variant="success">
                <UilPlusCircle aria-hidden="true" data-icon="inline-start" />
                New sprint
              </Button>
            }
          />
        </div>

        {sprints.length === 0 ? (
          <div className="flex h-28 items-center justify-center text-sm text-muted-foreground">
            No sprints yet. Create one to start planning.
          </div>
        ) : (
          <ul className="divide-y">
            {sprints.map((sprint) => {
              const range = formatSprintRange(sprint);
              const isActioning = actioningSprintId === sprint.id;
              const tasks = sprintTasks[sprint.id] ?? [];
              const deleteAction = isCurrentUserOwner ? (
                <DeleteConfirmDialog
                  ariaLabel={`Delete ${sprint.name}`}
                  onConfirm={() => handleDeleteSprint(sprint)}
                  title="Delete sprint"
                  trigger={
                    <Button disabled={isActioning} size="sm" type="button" variant="danger">
                      <UilTrashAlt aria-hidden="true" data-icon="inline-start" />
                      Delete
                    </Button>
                  }
                >
                  Are you sure you want to delete &quot;{sprint.name}&quot;? Its tasks will move back to the backlog.
                </DeleteConfirmDialog>
              ) : null;

              return (
                <li className="px-4 py-3" key={sprint.id}>
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h3
                          className="truncate text-sm font-medium"
                          title={sprint.name}
                        >
                          {sprint.name}
                        </h3>
                        <Badge
                          className={cn(
                            "border-transparent",
                            sprint.is_active
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {sprint.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {sprint.goal?.trim() ? (
                        <p className="truncate text-xs text-muted-foreground">
                          {sprint.goal}
                        </p>
                      ) : null}
                      {range ? (
                        <p className="text-xs text-muted-foreground">{range}</p>
                      ) : null}
                    </div>

                    <SprintSheet
                      onSaved={reload}
                      projectId={projectId}
                      sprint={sprint}
                      trigger={
                        <Button
                          aria-label={`Edit ${sprint.name}`}
                          size="icon-sm"
                          type="button"
                          variant="outline"
                        >
                          <FilePenLine aria-hidden="true" />
                        </Button>
                      }
                    />
                    {sprint.is_active ? (
                      <>
                        <Button
                          isLoading={isActioning}
                          onClick={() => handleToggleSprint(sprint)}
                          size="sm"
                          type="button"
                          variant="warning"
                        >
                          <SquareCheckBig aria-hidden="true" data-icon="inline-start" />
                          Close
                        </Button>
                        {deleteAction}
                      </>
                    ) : (
                      <>
                        <Button
                          disabled={Boolean(activeSprint) || isActioning}
                          isLoading={isActioning}
                          onClick={() => handleToggleSprint(sprint)}
                          size="sm"
                          type="button"
                          variant="success"
                        >
                          <PlayCircle aria-hidden="true" data-icon="inline-start" />
                          Start
                        </Button>
                        {deleteAction}
                      </>
                    )}
                  </div>

                  <div className="mt-3 rounded-md border bg-muted/20">
                    <p className="border-b px-3 py-2 text-xs text-muted-foreground">
                      {tasks.length} task{tasks.length === 1 ? "" : "s"}
                    </p>
                    {tasks.length === 0 ? (
                      <p className="px-3 py-3 text-sm text-muted-foreground">
                        No tasks in this sprint.
                      </p>
                    ) : (
                      <ul className="divide-y">
                        {tasks.map((task) => (
                          <li
                            className="flex items-center gap-3 px-3 py-2"
                            key={task.id}
                          >
                            <div className="min-w-0 flex-1 text-sm">
                              <span className="font-medium">{task.title}</span>
                              {task.tag?.trim() ? (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  {task.tag}
                                </span>
                              ) : null}
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <Badge variant="secondary">
                                {columns.find(
                                  (column) => column.id === task.column_id
                                )?.name ?? "Unknown"}
                              </Badge>
                              {task.assignee
                                ? (() => {
                                    const assigneeName =
                                      getAssigneeName(task) || "Assigned user";

                                    return (
                                      <Avatar size="sm" title={assigneeName}>
                                        <AvatarFallback>
                                          {getAssigneeInitials(assigneeName) ||
                                            "?"}
                                        </AvatarFallback>
                                      </Avatar>
                                    );
                                  })()
                                : null}
                              <CreateTaskSheet
                                columns={columns}
                                onCreated={reload}
                                projectId={projectId}
                                sprints={sprints}
                                task={task}
                                trigger={
                                  <Button
                                    aria-label={`Edit ${task.title}`}
                                    size="icon-sm"
                                    type="button"
                                    variant="warning"
                                  >
                                    <UilPen aria-hidden="true" />
                                  </Button>
                                }
                              />
                              <DeleteConfirmDialog
                                ariaLabel={`Delete ${task.title}`}
                                onConfirm={() => handleDeleteTask(task)}
                                title="Delete task"
                              >
                                Are you sure you want to delete &quot;{task.title}&quot;? This action cannot be undone.
                              </DeleteConfirmDialog>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
