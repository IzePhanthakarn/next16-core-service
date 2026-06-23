"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { CircleDashed, EllipsisVertical, Users } from "lucide-react";

import { LineMdLoadingLoop } from "@/assets/icons/LineMdLoadingLoop";
import { LucideFolderKanban } from "@/assets/icons/LucideFolderKanban";
import { UilPen } from "@/assets/icons/UilPen";
import { UilPlusCircle } from "@/assets/icons/UilPlusCircle";
import { UilTrashAlt } from "@/assets/icons/UilTrashAlt";
import { DeleteConfirmDialog } from "@/components/dialogs/delete-confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import PAGE_ROUTE from "@/constants/page_route";
import { appToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import {
  deleteProject,
  getProjectErrorMessage,
  getProjects,
} from "./functions";
import type { Project } from "./models";
import { PROJECT_STATUS_CONFIG } from "./projectMeta";
import { ProjectSheet } from "./ProjectSheet";

const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const reloadProjects = () => {
    setReloadKey((value) => value + 1);
  };

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getProjects();
        setProjects(data);
      } catch (error) {
        setErrorMessage(getProjectErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    void loadProjects();
  }, [reloadKey]);

  return { projects, isLoading, errorMessage, reloadProjects };
};

type ProjectCardMenuDialog = "edit" | "delete" | null;

type ProjectCardProps = {
  project: Project;
  onChanged: () => void;
};

const ProjectCard = ({ project, onChanged }: ProjectCardProps) => {
  const [dialog, setDialog] = useState<ProjectCardMenuDialog>(null);
  const memberCount = project.member_count ?? 0;
  const status = PROJECT_STATUS_CONFIG[project.status];

  const closeDialog = () => setDialog(null);

  const handleDelete = async () => {
    try {
      await deleteProject(project.id);
      appToast.success("Project deleted.");
      onChanged();
    } catch (error) {
      appToast.error(getProjectErrorMessage(error));
      throw error;
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-border/80 bg-card shadow-sm transition-colors hover:border-primary/30">
      <div className="h-1 bg-primary/80" />

      <div className="flex items-start justify-between gap-2 p-4 pb-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="size-2.5 shrink-0 rounded-full bg-primary" />
          <h2 className="min-w-0 truncate text-base font-semibold" title={project.title}>
            {project.title}
          </h2>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label="Project menu"
              className="-mr-1.5 -mt-1.5"
              size="icon"
              type="button"
              variant="ghost"
            >
              <EllipsisVertical aria-hidden="true" className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setDialog("edit")}>
              <UilPen aria-hidden="true" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setDialog("delete")}
            >
              <UilTrashAlt aria-hidden="true" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Link
        className="flex flex-1 flex-col gap-4 px-4 pb-4 outline-none"
        href={PAGE_ROUTE.PROJECTS.KANBAN(project.id)}
      >
        <p className="line-clamp-3 min-h-15 text-sm text-muted-foreground">
          {project.description?.trim() || "No description provided."}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2">
          <Badge className={cn("border-transparent", status.className)}>
            {status.label}
          </Badge>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users aria-hidden="true" className="size-4" />
            {memberCount} member{memberCount === 1 ? "" : "s"}
          </span>
        </div>
      </Link>

      <ProjectSheet
        mode="edit"
        project={project}
        open={dialog === "edit"}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeDialog();
          }
        }}
        onSaved={onChanged}
      />

      <DeleteConfirmDialog
        onConfirm={handleDelete}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeDialog();
          }
        }}
        open={dialog === "delete"}
        title="Delete project"
      >
        Are you sure you want to delete {project.title}? <br />
        This action cannot be undone.
      </DeleteConfirmDialog>
    </div>
  );
};

export const ProjectsPage = () => {
  const { projects, isLoading, errorMessage, reloadProjects } = useProjects();

  let content: ReactNode;

  if (isLoading) {
    content = (
      <div className="flex h-130 flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/20 text-sm text-muted-foreground">
        <LineMdLoadingLoop className="h-10 w-10 text-primary" />
        Loading projects...
      </div>
    );
  } else if (errorMessage) {
    content = (
      <div className="flex h-130 flex-col items-center justify-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-6 text-center text-sm text-destructive">
        <CircleDashed aria-hidden="true" className="size-8" />
        <p>{errorMessage}</p>
      </div>
    );
  } else if (projects.length) {
    content = (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            onChanged={reloadProjects}
            project={project}
          />
        ))}
      </div>
    );
  } else {
    content = (
      <div className="flex h-130 flex-col items-center justify-center gap-4 rounded-lg border border-dashed bg-muted/20 px-6 text-center text-sm text-muted-foreground">
        <div className="flex size-16 items-center justify-center rounded-full bg-card text-primary shadow-sm">
          <LucideFolderKanban aria-hidden="true" className="size-8" />
        </div>
        <div className="max-w-sm space-y-1">
          <p className="font-medium text-foreground">No projects yet</p>
          <p>
            Create your first project to start planning sprints, tasks, and
            notes in one place.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <LucideFolderKanban className="h-10 w-10 text-primary" />
            <h1 className="text-2xl font-semibold">Projects</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Plan and track your work across Kanban boards, sprints, and notes.
          </p>
        </div>
        <ProjectSheet
          mode="create"
          onSaved={reloadProjects}
          trigger={
            <Button
              className="w-fit font-medium"
              size="lg"
              type="button"
              variant="success"
            >
              <UilPlusCircle aria-hidden="true" data-icon="inline-start" />
              Create Project
            </Button>
          }
        />
      </div>

      <Separator />

      {content}
    </section>
  );
};
