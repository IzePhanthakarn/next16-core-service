"use client";

import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { appToast } from "@/lib/toast";

export const LogoutButton = () => {
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
      isLoading={isLoading}
      onClick={handleLogout}
      type="button"
      variant="outline"
    >
      <LogOutIcon aria-hidden="true" className="size-4" />
      Logout
    </Button>
  );
};
