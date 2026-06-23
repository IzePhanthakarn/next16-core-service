"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import { ClipboardList, ListTodo, Settings, Users } from "lucide-react";

import { LucideFolderKanban } from "@/assets/icons/LucideFolderKanban";
import PAGE_ROUTE from "@/constants/page_route";
import { cn } from "@/lib/utils";

type ProjectTab = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

type ProjectTabsProps = {
  projectId: string;
};

export const ProjectTabs = ({ projectId }: ProjectTabsProps) => {
  const pathname = usePathname();

  const tabs: ProjectTab[] = [
    { href: PAGE_ROUTE.PROJECTS.KANBAN(projectId), label: "Kanban", icon: LucideFolderKanban },
    { href: PAGE_ROUTE.PROJECTS.BACKLOGS(projectId), label: "Backlogs", icon: ListTodo },
    { href: PAGE_ROUTE.PROJECTS.NOTES(projectId), label: "Notes", icon: ClipboardList },
    { href: PAGE_ROUTE.PROJECTS.MEMBERS(projectId), label: "Members", icon: Users },
    { href: PAGE_ROUTE.PROJECTS.SETTINGS(projectId), label: "Settings", icon: Settings },
  ];

  return (
    <nav className="inline-flex w-fit items-center justify-center gap-0.5 rounded-lg bg-muted p-[3px] text-muted-foreground">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        const Icon = tab.icon;

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-all hover:text-foreground",
              isActive
                ? "bg-background text-foreground shadow-sm dark:bg-input/30"
                : "text-foreground/60"
            )}
            href={tab.href}
            key={tab.href}
          >
            <Icon aria-hidden="true" className="size-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
};
