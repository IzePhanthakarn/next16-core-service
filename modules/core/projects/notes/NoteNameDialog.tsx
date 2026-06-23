"use client";

import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { appToast } from "@/lib/toast";

type NoteNameDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  label: string;
  confirmLabel: string;
  placeholder?: string;
  initialValue?: string;
  onSubmit: (name: string) => Promise<void>;
};

export const NoteNameDialog = ({
  open,
  onOpenChange,
  title,
  label,
  confirmLabel,
  placeholder,
  initialValue = "",
  onSubmit,
}: NoteNameDialogProps) => {
  const [value, setValue] = useState(initialValue);
  const [wasOpen, setWasOpen] = useState(open);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset the input to the provided initial value each time the dialog opens.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setValue(initialValue);
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!value.trim()) {
      appToast.error("Please fill the name.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(value.trim());
      onOpenChange(false);
    } catch {
      // Keep the dialog open; the caller surfaces the error toast.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-2 py-5">
            <Label htmlFor="note-name-input">{label}</Label>
            <Input
              autoFocus
              id="note-name-input"
              maxLength={160}
              onChange={(event) => setValue(event.target.value)}
              placeholder={placeholder}
              value={value}
            />
          </div>

          <DialogFooter>
            <Button
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button isLoading={isSubmitting} type="submit" variant="success">
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
