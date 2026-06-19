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
import { UilTrashAlt } from "@/assets/icons/UilTrashAlt";

type DeleteConfirmDialogProps = {
  ariaLabel?: string;
  children: ReactNode;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  title: string;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const DeleteConfirmDialog = ({
  ariaLabel = "Delete",
  children,
  confirmLabel = "Delete",
  onConfirm,
  title,
  trigger,
  open,
  onOpenChange,
}: DeleteConfirmDialogProps) => {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = (next: boolean) => {
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  const handleConfirm = async () => {
    setIsConfirming(true);

    try {
      await onConfirm();
      setDialogOpen(false);
    } catch {
      // Keep the dialog open so the caller can show an error toast and retry.
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {(!isControlled || trigger) && (
        <DialogTrigger asChild>
          {trigger || (
            <Button
              aria-label={ariaLabel}
              size="icon-sm"
              type="button"
              variant="danger"
            >
              <UilTrashAlt aria-hidden="true" />
            </Button>
          )}
        </DialogTrigger>
      )}
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
            variant="danger"
          >
            <UilTrashAlt aria-hidden="true" data-icon="inline-start" />
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
