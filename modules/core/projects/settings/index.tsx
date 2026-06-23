"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleDashed, Crown, Users } from "lucide-react";

import { LineMdLoadingLoop } from "@/assets/icons/LineMdLoadingLoop";
import { UilPen } from "@/assets/icons/UilPen";
import { UilTrashAlt } from "@/assets/icons/UilTrashAlt";
import { DeleteConfirmDialog } from "@/components/dialogs/delete-confirm-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Textarea } from "@/components/ui/textarea";
import PAGE_ROUTE from "@/constants/page_route";
import { appToast } from "@/lib/toast";

import {
  deleteProject,
  getProject,
  getProjectErrorMessage,
  updateProject,
} from "../functions";
import type {
  ProjectDetail,
  ProjectMember,
  ProjectStatus,
} from "../models";
import {
  PROJECT_STATUS_CONFIG,
  PROJECT_STATUS_OPTIONS,
} from "../projectMeta";
import { type SettingsGeneralForm } from "./models";

const getMemberName = (member: ProjectMember) => {
  const name = [member.first_name, member.last_name]
    .filter((part) => part?.trim())
    .join(" ")
    .trim();

  return name || member.email || "Unknown user";
};

const getInitials = (member: ProjectMember) =>
  getMemberName(member)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

const useProjectSettings = (projectId: string) => {
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [generalForm, setGeneralForm] = useState<SettingsGeneralForm>({
    title: "",
    description: "",
    status: "planning",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const proj = await getProject(projectId);
        setProject(proj);
        setGeneralForm({
          title: proj.title,
          description: proj.description,
          status: proj.status,
        });
      } catch (error) {
        setErrorMessage(getProjectErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    void loadSettings();
  }, [projectId]);

  return {
    errorMessage,
    generalForm,
    isLoading,
    project,
    setGeneralForm,
    setProject,
  };
};

type ProjectSettingsPageProps = {
  currentUserId: string;
  projectId: string;
};

export const ProjectSettingsPage = ({
  currentUserId,
  projectId,
}: ProjectSettingsPageProps) => {
  const router = useRouter();
  const { errorMessage, generalForm, isLoading, project, setGeneralForm, setProject } =
    useProjectSettings(projectId);

  const [isSavingGeneral, setIsSavingGeneral] = useState(false);

  const handleSaveGeneral = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!generalForm.title.trim()) {
      appToast.error("Please fill the project title.");
      return;
    }

    if (!generalForm.description.trim()) {
      appToast.error("Please fill the project description.");
      return;
    }

    if (!project) {
      return;
    }

    setIsSavingGeneral(true);

    try {
      const updated = await updateProject(projectId, {
        title: generalForm.title.trim(),
        description: generalForm.description.trim(),
        status: generalForm.status,
        start_date: project.start_date,
        finish_date: project.finish_date,
      });
      setProject((prev) => (prev ? { ...prev, ...updated } : prev));
      appToast.success("Project saved.");
    } catch (error) {
      appToast.error(getProjectErrorMessage(error));
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      await deleteProject(projectId);
      appToast.success("Project deleted.");
      router.push(PAGE_ROUTE.PROJECTS.INDEX);
    } catch (error) {
      appToast.error(getProjectErrorMessage(error));
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[440px] items-center justify-center rounded-lg border border-dashed bg-muted/20">
        <LineMdLoadingLoop className="h-10 w-10 text-primary" />
      </div>
    );
  }

  if (errorMessage || !project) {
    return (
      <div className="flex h-[440px] flex-col items-center justify-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-6 text-center text-sm text-destructive">
        <CircleDashed aria-hidden="true" className="size-8" />
        <p>{errorMessage || "Project not found."}</p>
      </div>
    );
  }

  const members = project.members ?? [];
  const isCurrentUserOwner = project.owner_id === currentUserId;

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <UilPen className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">General Information</h2>
        </div>

        <form className="flex flex-col gap-4 px-4 py-4" onSubmit={handleSaveGeneral}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="settings-project-title">Title</Label>
              {isCurrentUserOwner ? (
                <Input
                  id="settings-project-title"
                  maxLength={255}
                  onChange={(event) =>
                    setGeneralForm((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Project title"
                  value={generalForm.title}
                />
              ) : (
                <p className="flex min-h-9 items-center rounded-lg border bg-muted/30 px-3 text-sm">
                  {project.title}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="settings-project-status">Status</Label>
              {isCurrentUserOwner ? (
                <Select
                  onValueChange={(value) =>
                    setGeneralForm((prev) => ({
                      ...prev,
                      status: value as ProjectStatus,
                    }))
                  }
                  value={generalForm.status}
                >
                  <SelectTrigger className="h-9 min-h-9 w-full" id="settings-project-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectGroup>
                      {PROJECT_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {PROJECT_STATUS_CONFIG[status].label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              ) : (
                <p className="flex min-h-9 items-center rounded-lg border bg-muted/30 px-3 text-sm">
                  {PROJECT_STATUS_CONFIG[project.status].label}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="settings-project-description">Description</Label>
            {isCurrentUserOwner ? (
              <Textarea
                className="min-h-24 resize-none"
                id="settings-project-description"
                onChange={(event) =>
                  setGeneralForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="What is this project about?"
                value={generalForm.description}
              />
            ) : (
              <p className="min-h-24 whitespace-pre-wrap rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                {project.description}
              </p>
            )}
          </div>

          {isCurrentUserOwner ? (
            <div className="flex justify-end">
              <Button isLoading={isSavingGeneral} size="lg" type="submit" variant="success">
                Save
              </Button>
            </div>
          ) : null}
        </form>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Users aria-hidden="true" className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Members</h2>
          <span className="text-xs text-muted-foreground">({members.length})</span>
        </div>

        {members.length === 0 ? (
          <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
            No members yet.
          </div>
        ) : (
          <ul className="divide-y">
            {members.map((member) => {
              const owner = member.user_id === project.owner_id;

              return (
                <li
                  className="flex items-center gap-3 px-4 py-3"
                  key={member.user_id}
                >
                  <Avatar className="size-9">
                    <AvatarFallback className="text-xs">
                      {getInitials(member)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                      {getMemberName(member)}
                      {owner ? (
                        <Crown
                          aria-label="Owner"
                          className="size-3.5 shrink-0 text-amber-500"
                        />
                      ) : null}
                    </p>
                    {member.email ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    ) : null}
                  </div>

                  {owner ? (
                    <span className="text-xs font-medium text-muted-foreground">
                      Owner
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {isCurrentUserOwner ? (
        <div className="overflow-hidden rounded-lg border border-destructive/30 bg-card">
          <div className="flex items-center gap-2 border-b border-destructive/30 px-4 py-3">
            <UilTrashAlt className="size-4 text-destructive" />
            <h2 className="text-sm font-semibold text-destructive">
              Danger Zone
            </h2>
          </div>

          <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Delete this project</p>
              <p className="text-xs text-muted-foreground">
                Permanently remove the project and all of its boards, sprints,
                tasks, and notes.
              </p>
            </div>
            <DeleteConfirmDialog
              confirmLabel="Delete project"
              onConfirm={handleDeleteProject}
              title="Delete project"
              trigger={
                <Button
                  className="shrink-0 font-medium"
                  size="lg"
                  type="button"
                  variant="danger"
                >
                  <UilTrashAlt aria-hidden="true" data-icon="inline-start" />
                  Delete project
                </Button>
              }
            >
              Are you sure you want to delete {project.title}? <br />
              This action cannot be undone.
            </DeleteConfirmDialog>
          </div>
        </div>
      ) : null}
    </div>
  );
};
