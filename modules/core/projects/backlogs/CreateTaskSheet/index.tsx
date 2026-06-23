"use client";

import { type FormEvent, useEffect, useState } from "react";
import { format } from "date-fns";
import { MessageSquare } from "lucide-react";

import { LineMdLoadingLoop } from "@/assets/icons/LineMdLoadingLoop";
import { UilPen } from "@/assets/icons/UilPen";
import { UilPlusCircle } from "@/assets/icons/UilPlusCircle";
import { UilRedo } from "@/assets/icons/UilRedo";
import { Markdown } from "@/components/markdown/markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { appToast } from "@/lib/toast";
import {
  createTask,
  createTaskComment,
  getProject,
  getProjectErrorMessage,
  getTaskComments,
  updateTask,
} from "@/modules/core/projects/functions";
import type {
  ProjectMember,
  Task,
  TaskComment,
  TaskPriority,
  TaskType,
} from "@/modules/core/projects/models";
import {
  PRIORITY_CONFIG,
  PRIORITY_OPTIONS,
  TYPE_CONFIG,
  TYPE_OPTIONS,
} from "@/modules/core/projects/taskMeta";

import {
  getDefaultCreateTaskForm,
  type CreateTaskSheetFormState,
  type CreateTaskSheetProps,
} from "./models";

const BACKLOG_SPRINT_VALUE = "backlog";
const UNASSIGNED_VALUE = "unassigned";

const getTaskForm = (task: Task): CreateTaskSheetFormState => ({
  title: task.title,
  description: task.description,
  type: task.type,
  priority: task.priority,
  tag: task.tag ?? "",
  columnId: task.column_id,
  sprintId: task.sprint_id ?? BACKLOG_SPRINT_VALUE,
  assigneeId: task.assignee_id ?? UNASSIGNED_VALUE,
  storyPoints: task.story_points?.toString() ?? "",
});

const getMemberLabel = (member: ProjectMember) =>
  [member.first_name, member.last_name].filter(Boolean).join(" ") ||
  member.email ||
  member.user_id;

const formatCommentDate = (value: string) => {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : format(date, "d MMM yyyy, HH:mm");
};

export const CreateTaskSheet = ({
  columns = [],
  projectId,
  sprintId,
  sprints = [],
  task,
  onCreated,
  onOpenChange,
  open: controlledOpen,
  trigger,
}: CreateTaskSheetProps) => {
  const isEditing = Boolean(task);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [form, setForm] = useState<CreateTaskSheetFormState>(
    task ? () => getTaskForm(task) : getDefaultCreateTaskForm
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;

  const updateOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      setForm(task ? getTaskForm(task) : getDefaultCreateTaskForm());
      setNewComment("");
    }
    if (controlledOpen === undefined) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const loadMembers = async () => {
      setIsLoadingMembers(true);

      try {
        const project = await getProject(projectId);
        setMembers(project.members);
      } catch {
        setMembers([]);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    void loadMembers();
  }, [open, projectId]);

  useEffect(() => {
    if (!open || !task) {
      return;
    }

    const loadComments = async () => {
      setIsLoadingComments(true);

      try {
        setComments(await getTaskComments(task.id));
      } catch {
        setComments([]);
      } finally {
        setIsLoadingComments(false);
      }
    };

    void loadComments();
  }, [open, task]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) {
      appToast.error("Please fill the task title.");
      return;
    }

    if (!form.description.trim()) {
      appToast.error("Please fill the task description.");
      return;
    }

    const storyPoints = form.storyPoints.trim()
      ? Number(form.storyPoints)
      : null;

    if (storyPoints !== null && (!Number.isFinite(storyPoints) || storyPoints < 0)) {
      appToast.error("Man-day must be zero or greater.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (task) {
        await updateTask(task.id, {
          title: form.title.trim(),
          description: form.description.trim(),
          type: form.type,
          priority: form.priority,
          tag: form.tag.trim() || null,
          assignee_id:
            form.assigneeId === UNASSIGNED_VALUE ? null : form.assigneeId,
          story_points: storyPoints,
          column_id: form.columnId,
          sprint_id:
            form.sprintId === BACKLOG_SPRINT_VALUE ? null : form.sprintId,
        });
        appToast.success("Task updated.");
      } else {
        await createTask({
          project_id: projectId,
          sprint_id: sprintId,
          title: form.title.trim(),
          description: form.description.trim(),
          type: form.type,
          priority: form.priority,
          tag: form.tag.trim() || undefined,
          assignee_id:
            form.assigneeId === UNASSIGNED_VALUE ? undefined : form.assigneeId,
          story_points: storyPoints,
        });
        appToast.success("Task added to backlog.");
      }

      updateOpen(false);
      onCreated?.();
    } catch (error) {
      appToast.error(getProjectErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!task || !newComment.trim()) {
      appToast.error("Please write a comment.");
      return;
    }

    setIsPostingComment(true);

    try {
      const comment = await createTaskComment(task.id, {
        content: newComment.trim(),
      });
      setComments((current) => [...current, comment]);
      setNewComment("");
    } catch (error) {
      appToast.error(getProjectErrorMessage(error));
    } finally {
      setIsPostingComment(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={updateOpen}>
      {trigger ? <SheetTrigger asChild>{trigger}</SheetTrigger> : null}
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader className="border-b pr-12">
          <SheetTitle>{isEditing ? "Edit task" : "New backlog task"}</SheetTitle>
        </SheetHeader>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 overflow-y-auto px-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="task-title">Title</Label>
              <Input
                autoFocus
                id="task-title"
                maxLength={255}
                onChange={(event) =>
                  setForm((value) => ({ ...value, title: event.target.value }))
                }
                placeholder="Task title"
                value={form.title}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                className="min-h-32 resize-none"
                id="task-description"
                onChange={(event) =>
                  setForm((value) => ({
                    ...value,
                    description: event.target.value,
                  }))
                }
                placeholder="Describe the task (Markdown supported)..."
                value={form.description}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      type: value as TaskType,
                    }))
                  }
                  value={form.type}
                >
                  <SelectTrigger className="h-9 min-h-9 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectGroup>
                      {TYPE_OPTIONS.map((type) => (
                        <SelectItem key={type} value={type}>
                          {TYPE_CONFIG[type].label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      priority: value as TaskPriority,
                    }))
                  }
                  value={form.priority}
                >
                  <SelectTrigger className="h-9 min-h-9 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectGroup>
                      {PRIORITY_OPTIONS.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {PRIORITY_CONFIG[priority].label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="task-tag">Tag</Label>
              <Input
                id="task-tag"
                maxLength={20}
                onChange={(event) =>
                  setForm((value) => ({ ...value, tag: event.target.value }))
                }
                placeholder="Optional, max 20 chars"
                value={form.tag}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Assign to</Label>
                <Select
                  disabled={isLoadingMembers}
                  onValueChange={(value) =>
                    setForm((current) => ({ ...current, assigneeId: value }))
                  }
                  value={form.assigneeId}
                >
                  <SelectTrigger className="h-9 min-h-9 w-full">
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectGroup>
                      <SelectItem value={UNASSIGNED_VALUE}>
                        Unassigned
                      </SelectItem>
                      {members.map((member) => (
                        <SelectItem key={member.user_id} value={member.user_id}>
                          {getMemberLabel(member)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="task-story-points">Man-day</Label>
                <Input
                  id="task-story-points"
                  min="0"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      storyPoints: event.target.value,
                    }))
                  }
                  placeholder="e.g. 1.5"
                  step="0.5"
                  type="number"
                  value={form.storyPoints}
                />
              </div>
            </div>

            {isEditing ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Column</Label>
                    <Select
                      onValueChange={(value) =>
                        setForm((current) => ({ ...current, columnId: value }))
                      }
                      value={form.columnId}
                    >
                      <SelectTrigger className="h-9 min-h-9 w-full">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectGroup>
                          {columns.map((column) => (
                            <SelectItem key={column.id} value={column.id}>
                              {column.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Sprint</Label>
                    <Select
                      onValueChange={(value) =>
                        setForm((current) => ({ ...current, sprintId: value }))
                      }
                      value={form.sprintId}
                    >
                      <SelectTrigger className="h-9 min-h-9 w-full">
                        <SelectValue placeholder="Select sprint" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectGroup>
                          <SelectItem value={BACKLOG_SPRINT_VALUE}>
                            Backlog (no sprint)
                          </SelectItem>
                          {sprints.map((sprint) => (
                            <SelectItem key={sprint.id} value={sprint.id}>
                              {sprint.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare aria-hidden="true" className="size-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">
                      Comments
                      {comments.length ? (
                        <span className="ml-1 text-muted-foreground">
                          ({comments.length})
                        </span>
                      ) : null}
                    </h3>
                  </div>

                  {isLoadingComments ? (
                    <div className="flex justify-center py-4">
                      <LineMdLoadingLoop className="size-7 text-primary" />
                    </div>
                  ) : null}

                  {!isLoadingComments && comments.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-3 text-center text-sm text-muted-foreground">
                      No comments yet. Start the conversation below.
                    </p>
                  ) : null}

                  {!isLoadingComments && comments.length ? (
                    <ul className="flex flex-col gap-3">
                      {comments.map((comment) => (
                        <li className="rounded-lg border bg-card p-3" key={comment.id}>
                          <p className="mb-1.5 text-right text-xs text-muted-foreground">
                            {formatCommentDate(comment.created_at)}
                          </p>
                          <Markdown>{comment.content}</Markdown>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <Textarea
                    className="min-h-20 resize-none"
                    onChange={(event) => setNewComment(event.target.value)}
                    placeholder="Add a comment (Markdown supported)..."
                    value={newComment}
                  />
                  <div className="flex justify-end">
                    <Button
                      isLoading={isPostingComment}
                      onClick={handleAddComment}
                      size="sm"
                      type="button"
                      variant="success"
                    >
                      <UilPlusCircle aria-hidden="true" data-icon="inline-start" />
                      Add comment
                    </Button>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          <SheetFooter className="border-t sm:flex-row sm:justify-end">
            {!isEditing ? (
              <Button
                disabled={isSubmitting}
                onClick={() => setForm(getDefaultCreateTaskForm())}
                size="lg"
                type="button"
                variant="outline"
              >
                <UilRedo aria-hidden="true" data-icon="inline-start" />
                Reset form
              </Button>
            ) : null}
            <Button isLoading={isSubmitting} size="lg" type="submit" variant="success">
              {isEditing ? (
                <UilPen aria-hidden="true" data-icon="inline-start" />
              ) : (
                <UilPlusCircle aria-hidden="true" data-icon="inline-start" />
              )}
              {isEditing ? "Save changes" : "Add task"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
