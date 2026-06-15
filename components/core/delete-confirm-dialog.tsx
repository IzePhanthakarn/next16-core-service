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
};

export const DeleteConfirmDialog = ({
  ariaLabel = "Delete",
  children,
  confirmLabel = "Delete",
  onConfirm,
  title,
  trigger,
}: DeleteConfirmDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

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
