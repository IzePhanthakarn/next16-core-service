"use client";

import { useState } from "react";
import { format } from "date-fns";
import { FileText, Folder, X } from "lucide-react";

import { UilEye } from "@/assets/icons/UilEye";
import { UilPen } from "@/assets/icons/UilPen";
import { Markdown } from "@/components/markdown/markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { appToast } from "@/lib/toast";
import {
  getProjectErrorMessage,
  updateNote,
} from "@/modules/core/projects/functions";
import type { Note } from "@/modules/core/projects/models";

type NoteEditorProps = {
  projectId: string;
  note: Note | null;
  onSaved: (note: Note) => void;
};

const formatUpdatedAt = (value: string) => {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : format(date, "d MMM yyyy, HH:mm");
};

export const NoteEditor = ({ projectId, note, onSaved }: NoteEditorProps) => {
  const [trackedId, setTrackedId] = useState<string | null>(note?.id ?? null);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [draft, setDraft] = useState(note?.content ?? "");
  const [isSaving, setIsSaving] = useState(false);

  // Sync the draft and view mode whenever a different note is opened. New/empty
  // notes open directly in edit mode for a smoother writing flow.
  if ((note?.id ?? null) !== trackedId) {
    setTrackedId(note?.id ?? null);
    setDraft(note?.content ?? "");
    setMode(note && note.type !== "folder" && !note.content?.trim() ? "edit" : "view");
  }

  if (!note) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-sm text-muted-foreground">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted text-primary">
          <FileText aria-hidden="true" className="size-7" />
        </div>
        <p>Select a note from the tree to view or edit it.</p>
      </div>
    );
  }

  if (note.type === "folder") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-sm text-muted-foreground">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted text-primary">
          <Folder aria-hidden="true" className="size-7" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-foreground">{note.title}</p>
          <p>This is a folder. Add notes inside it from the toolbar.</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const updated = await updateNote(projectId, note.id, {
        title: note.title,
        content: draft,
      });
      onSaved(updated);
      setMode("view");
      appToast.success("Note saved.");
    } catch (error) {
      appToast.error(getProjectErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(note.content ?? "");
    setMode("view");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold" title={note.title}>
            {note.title}
          </h2>
          <p className="text-xs text-muted-foreground">
            Updated {formatUpdatedAt(note.updated_at)}
          </p>
        </div>

        {mode === "view" ? (
          <Button
            onClick={() => setMode("edit")}
            size="sm"
            type="button"
            variant="warning"
          >
            <UilPen aria-hidden="true" data-icon="inline-start" />
            Edit
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              disabled={isSaving}
              onClick={handleCancel}
              size="sm"
              type="button"
              variant="outline"
            >
              <X aria-hidden="true" data-icon="inline-start" />
              Cancel
            </Button>
            <Button
              isLoading={isSaving}
              onClick={handleSave}
              size="sm"
              type="button"
              variant="success"
            >
              <UilEye aria-hidden="true" data-icon="inline-start" />
              Save
            </Button>
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {mode === "edit" ? (
          <Textarea
            className="h-full min-h-80 w-full resize-none font-mono text-sm"
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Write your note in Markdown..."
            value={draft}
          />
        ) : note.content?.trim() ? (
          <Markdown>{note.content}</Markdown>
        ) : (
          <p className="text-sm text-muted-foreground">
            This note is empty. Click Edit to start writing.
          </p>
        )}
      </div>
    </div>
  );
};
