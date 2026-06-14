"use client";

import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, type buttonVariants } from "@/components/ui/button";
import { appToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

type LogoutButtonProps = VariantProps<typeof buttonVariants> & {
  className?: string;
};

export const LogoutButton = ({
  className,
  variant = "outline",
}: LogoutButtonProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      appToast.success("Logout success.");
      router.replace("/login");
      router.refresh();
    } catch {
      appToast.error("Logout failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className={cn(className)}
      isLoading={isLoading}
      onClick={handleLogout}
      type="button"
      variant={variant}
    >
      <LogOutIcon aria-hidden="true" className="size-4" />
      Logout
    </Button>
  );
};
