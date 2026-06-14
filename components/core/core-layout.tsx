import { AppNavbar } from "@/components/core/app-navbar";
import { AppSidebar } from "@/components/core/app-sidebar";
import { getCurrentUser } from "@/lib/current-user";

type CoreLayoutProps = {
  children: React.ReactNode;
};

export const CoreLayout = async ({ children }: CoreLayoutProps) => {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppNavbar user={user} />
        <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
        <footer className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
          Copyright &copy; 2026 Created by{" "}
          <span className="font-medium text-primary">IzePhanthakarn</span>
        </footer>
      </div>
    </div>
  );
};
