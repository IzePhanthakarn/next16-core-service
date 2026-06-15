"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { LucideTimer } from "@/assets/icons/LucideTimer";
import { LucideLayoutDashboard } from "@/assets/icons/LucideLayoutDashboard";
import PAGE_ROUTE from "@/constants/page_route";
import { LucideTags } from "@/assets/icons/LucideTags";

const navItems = [
  {
    href: PAGE_ROUTE.DASHBOARD,
    label: "Dashboard",
    icon: <LucideLayoutDashboard className="w-6 h-6" />
  },
  {
    href: PAGE_ROUTE.WORK_LOGS.INDEX,
    label: "Work Logs",
    icon: <LucideTimer className="w-6 h-6"/>
  },
  {
    href: PAGE_ROUTE.PROPERTIES.INDEX,
    label: "Properties",
    icon: <LucideTags className="h-6 w-6" />,
  },
];

export const AppSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
      <div className="flex h-16 shrink-0 items-center border-b px-5">
        <Link className="text-lg font-semibold" href={PAGE_ROUTE.DASHBOARD}>
          Core Service
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive &&
                  "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
              )}
              href={item.href}
              key={item.href}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
