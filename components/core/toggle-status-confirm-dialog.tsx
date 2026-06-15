"use client";

import { type ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ToggleStatusConfirmDialogProps = {
  ariaLabel?: string;
  children: ReactNode;
  confirmLabel?: string;
  isActive: boolean;
  onConfirm: () => Promise<void> | void;
  title: string;
  trigger: ReactNode;
};

export const ToggleStatusConfirmDialog = ({
  ariaLabel = "Toggle status",
  children,
  confirmLabel,
  isActive,
  onConfirm,
  title,
  trigger,
}: ToggleStatusConfirmDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const resolvedConfirmLabel = confirmLabel ?? (isActive ? "Deactivate" : "Activate");

  const handleConfirm = async () => {
    setIsConfirming(true);

    try {
      await onConfirm();
      setOpen(false);
    } catch {
      // Keep the dialog open so the caller can show an error toast and retry.
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild aria-label={ariaLabel}>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="pb-3 pt-5 text-center">
            {children}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={isConfirming} type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            isLoading={isConfirming}
            onClick={handleConfirm}
            type="button"
            variant={isActive ? "danger" : "success"}
          >
            {resolvedConfirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
