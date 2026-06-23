"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import PAGE_ROUTE from "@/constants/page_route";

import { getProject, getProjectErrorMessage } from "../functions";
import type { ProjectDetail } from "../models";
import { ProjectTabs } from "./ProjectTabs";

type ProjectDetailLayoutProps = {
  projectId: string;
  children: ReactNode;
};

export const ProjectDetailLayout = ({
  projectId,
  children,
}: ProjectDetailLayoutProps) => {
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadProject = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getProject(projectId);
        setProject(data);
      } catch (error) {
        setErrorMessage(getProjectErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    void loadProject();
  }, [projectId]);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="size-3 shrink-0 rounded-full bg-primary" />
            {isLoading ? (
              <span className="h-7 w-48 animate-pulse rounded bg-muted" />
            ) : (
              <h1 className="min-w-0 truncate text-2xl font-semibold">
                {project?.title ?? "Project"}
              </h1>
            )}
          </div>
          <p className="line-clamp-1 text-sm text-muted-foreground">
            {errorMessage ||
              project?.description?.trim() ||
              "Manage your board, backlog, sprints, and notes."}
          </p>
        </div>

        <Button asChild size="lg" variant="outline">
          <Link href={PAGE_ROUTE.PROJECTS.INDEX}>
            <ArrowLeft aria-hidden="true" data-icon="inline-start" />
            Back to Projects
          </Link>
        </Button>
      </div>

      <ProjectTabs projectId={projectId} />

      <Separator />

      {children}
    </section>
  );
};
