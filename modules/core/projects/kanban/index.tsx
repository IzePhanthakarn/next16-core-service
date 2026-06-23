"use client";

import { useEffect, useRef, useState } from "react";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { format } from "date-fns";
import { CircleDashed, Target } from "lucide-react";

import { LineMdLoadingLoop } from "@/assets/icons/LineMdLoadingLoop";
import { LucideTimer } from "@/assets/icons/LucideTimer";
import { UilPlusCircle } from "@/assets/icons/UilPlusCircle";
import { Button } from "@/components/ui/button";
import { appToast } from "@/lib/toast";

import { CreateTaskSheet } from "../backlogs/CreateTaskSheet";
import {
  getKanban,
  getProjectErrorMessage,
  getSprints,
  updateTask,
} from "../functions";
import type { BoardColumn, Sprint, Task } from "../models";
import { TaskCardContent } from "./KanbanCard";
import { KanbanColumn } from "./KanbanColumn";

type ColumnsMap = Record<string, Task[]>;

const useKanbanBoard = (projectId: string) => {
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [columnsMap, setColumnsMap] = useState<ColumnsMap>({});
  const [hasBoard, setHasBoard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const reload = () => setReloadKey((value) => value + 1);

  useEffect(() => {
    const loadBoard = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [kanban, sprintList] = await Promise.all([
          getKanban(projectId),
          getSprints(projectId),
        ]);

        const sortedColumns = [...kanban.columns].sort(
          (first, second) => first.order_index - second.order_index
        );
        const map: ColumnsMap = {};
        sortedColumns.forEach((column) => {
          map[column.id] = column.tasks;
        });

        setHasBoard(Boolean(kanban.board_id));
        setColumns(
          sortedColumns.map(({ id, name, order_index }) => ({
            id,
            name,
            order_index,
          }))
        );
        setColumnsMap(map);
        setSprint(kanban.active_sprint);
        setSprints(sprintList);
      } catch (error) {
        setErrorMessage(getProjectErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    void loadBoard();
  }, [projectId, reloadKey]);

  return {
    columns,
    columnsMap,
    errorMessage,
    hasBoard,
    isLoading,
    reload,
    setColumnsMap,
    sprint,
    sprints,
  };
};

const formatSprintRange = (sprint: Sprint) => {
  const parts = [sprint.start_date, sprint.end_date]
    .filter((value): value is string => Boolean(value))
    .map((value) => {
      const date = new Date(value);

      return Number.isNaN(date.getTime()) ? value : format(date, "d MMM");
    });

  return parts.join(" – ");
};

type KanbanBoardProps = {
  projectId: string;
};

export const KanbanBoard = ({ projectId }: KanbanBoardProps) => {
  const {
    columns,
    columnsMap,
    errorMessage,
    hasBoard,
    isLoading,
    reload,
    setColumnsMap,
    sprint,
    sprints,
  } = useKanbanBoard(projectId);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false);
  const sourceRef = useRef<{ columnId: string; index: number } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findContainer = (id: string) => {
    if (id in columnsMap) {
      return id;
    }

    return Object.keys(columnsMap).find((columnId) =>
      columnsMap[columnId].some((task) => task.id === id)
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = String(event.active.id);
    const container = findContainer(activeId);

    if (!container) {
      return;
    }

    const index = columnsMap[container].findIndex(
      (task) => task.id === activeId
    );
    sourceRef.current = { columnId: container, index };
    setActiveTask(columnsMap[container][index] ?? null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setColumnsMap((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const activeIndex = activeItems.findIndex((task) => task.id === activeId);

      if (activeIndex < 0) {
        return prev;
      }

      const movingTask = activeItems[activeIndex];
      const overIndex =
        overId in prev
          ? overItems.length
          : overItems.findIndex((task) => task.id === overId);
      const newIndex = overIndex >= 0 ? overIndex : overItems.length;

      return {
        ...prev,
        [activeContainer]: activeItems.filter((task) => task.id !== activeId),
        [overContainer]: [
          ...overItems.slice(0, newIndex),
          movingTask,
          ...overItems.slice(newIndex),
        ],
      };
    });
  };

  const persistColumnChange = async (taskId: string, columnId: string) => {
    try {
      await updateTask(taskId, { column_id: columnId });
    } catch (error) {
      appToast.error(getProjectErrorMessage(error));
      reload();
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const source = sourceRef.current;

    setActiveTask(null);
    sourceRef.current = null;

    if (!over || !source) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer) {
      return;
    }

    if (activeContainer === overContainer) {
      const items = columnsMap[activeContainer];
      const oldIndex = items.findIndex((task) => task.id === activeId);
      const newIndex =
        overId in columnsMap
          ? items.length - 1
          : items.findIndex((task) => task.id === overId);

      if (newIndex >= 0 && oldIndex !== newIndex) {
        setColumnsMap((prev) => ({
          ...prev,
          [activeContainer]: arrayMove(prev[activeContainer], oldIndex, newIndex),
        }));
      }
    }

    // Persist only when the task moved to a different column (no ordering field
    // exists on the backend, so in-column reorders are visual only).
    if (overContainer !== source.columnId) {
      void persistColumnChange(activeId, overContainer);
    }
  };

  const handleOpenTask = (task: Task) => {
    setSelectedTask(task);
    setIsTaskSheetOpen(true);
  };

  const handleTaskSheetOpenChange = (open: boolean) => {
    setIsTaskSheetOpen(open);

    if (!open) {
      setSelectedTask(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-110 flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/20 text-sm text-muted-foreground">
        <LineMdLoadingLoop className="h-10 w-10 text-primary" />
        Loading board...
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex h-110 flex-col items-center justify-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-6 text-center text-sm text-destructive">
        <CircleDashed aria-hidden="true" className="size-8" />
        <p>{errorMessage}</p>
      </div>
    );
  }

  if (!hasBoard || !columns.length) {
    return (
      <div className="flex h-110 flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/20 px-6 text-center text-sm text-muted-foreground">
        <p className="font-medium text-foreground">No board columns</p>
        <p>This project does not have a board configured yet.</p>
      </div>
    );
  }

  if (!sprint) {
    return (
      <div className="flex h-110 flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/20 px-6 text-center text-sm text-muted-foreground">
        <div className="flex size-16 items-center justify-center rounded-full bg-card text-primary shadow-sm">
          <LucideTimer aria-hidden="true" className="size-8" />
        </div>
        <div className="max-w-sm space-y-1">
          <p className="font-medium text-foreground">No active sprint</p>
          <p>
            Start a sprint from the Backlogs tab to populate the board with
            tasks.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <LucideTimer aria-hidden="true" className="size-5 shrink-0 text-primary" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-sm font-semibold">{sprint.name}</h2>
              {formatSprintRange(sprint) ? (
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatSprintRange(sprint)}
                </span>
              ) : null}
            </div>
            {sprint.goal?.trim() ? (
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <Target aria-hidden="true" className="size-3 shrink-0" />
                {sprint.goal}
              </p>
            ) : null}
          </div>
        </div>
        <CreateTaskSheet
          onCreated={reload}
          projectId={projectId}
          sprintId={sprint.id}
          trigger={
            <Button className="font-medium" size="sm" type="button" variant="success">
              <UilPlusCircle aria-hidden="true" data-icon="inline-start" />
              New task
            </Button>
          }
        />
      </div>

      <DndContext
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
        sensors={sensors}
      >
        <div className="grid grid-cols-4 min-h-108 gap-4 pb-2">
          {columns.map((column) => (
            <KanbanColumn
              column={column}
              key={column.id}
              onOpenTask={handleOpenTask}
              tasks={columnsMap[column.id] ?? []}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCardContent className="rotate-1 shadow-md" task={activeTask} />
          ) : null}
        </DragOverlay>
      </DndContext>

      {selectedTask ? (
        <CreateTaskSheet
          columns={columns}
          onCreated={reload}
          onOpenChange={handleTaskSheetOpenChange}
          open={isTaskSheetOpen}
          projectId={projectId}
          sprints={sprints}
          task={selectedTask}
        />
      ) : null}
    </div>
  );
};
