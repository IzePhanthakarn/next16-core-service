"use client";

import { useEffect, useState } from "react";
import { CircleDashed, FilePlus, FolderPlus } from "lucide-react";

import { LineMdLoadingLoop } from "@/assets/icons/LineMdLoadingLoop";
import { DeleteConfirmDialog } from "@/components/dialogs/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import { appToast } from "@/lib/toast";

import {
  createNote,
  deleteNote,
  getNotes,
  getProjectErrorMessage,
  updateNote,
} from "../functions";
import type { Note } from "../models";
import { findNoteById } from "./models";
import { NoteEditor } from "./NoteEditor";
import { NoteNameDialog } from "./NoteNameDialog";
import { NoteTree } from "./NoteTree";

const useNotes = (projectId: string) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const reload = () => setReloadKey((value) => value + 1);

  useEffect(() => {
    const loadNotes = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getNotes(projectId);
        setNotes(data);
      } catch (error) {
        setErrorMessage(getProjectErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    void loadNotes();
  }, [projectId, reloadKey]);

  return { notes, isLoading, errorMessage, reload };
};

type ProjectNotesPageProps = {
  projectId: string;
};

export const ProjectNotesPage = ({ projectId }: ProjectNotesPageProps) => {
  const { notes, isLoading, errorMessage, reload } = useNotes(projectId);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [createMode, setCreateMode] = useState<"folder" | "file" | null>(null);
  const [createParentId, setCreateParentId] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<Note | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);

  const selectedNote = selectedId ? findNoteById(notes, selectedId) : null;

  const handleToggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreate = async (name: string) => {
    const isFolder = createMode === "folder";

    try {
      const created = await createNote(projectId, {
        parent_id: createParentId,
        type: isFolder ? "folder" : "file",
        title: name,
        content: isFolder ? undefined : "",
      });

      setSelectedId(created.id);
      setExpandedIds((prev) => {
        const next = new Set(prev);
        if (createParentId) {
          next.add(createParentId);
        }
        return next;
      });
      reload();
    } catch (error) {
      appToast.error(getProjectErrorMessage(error));
      throw error;
    }
  };

  const handleRename = async (name: string) => {
    if (!renameTarget) {
      return;
    }

    try {
      await updateNote(projectId, renameTarget.id, {
        title: name,
        content: renameTarget.content,
      });
      reload();
    } catch (error) {
      appToast.error(getProjectErrorMessage(error));
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await deleteNote(projectId, deleteTarget.id);
      if (selectedId && findNoteById([deleteTarget], selectedId)) {
        setSelectedId(null);
      }
      appToast.success(
        deleteTarget.type === "folder" ? "Folder deleted." : "Note deleted."
      );
      reload();
    } catch (error) {
      appToast.error(getProjectErrorMessage(error));
      throw error;
    }
  };

  let treeContent;

  if (isLoading) {
    treeContent = (
      <div className="flex h-full items-center justify-center">
        <LineMdLoadingLoop className="size-8 text-primary" />
      </div>
    );
  } else if (errorMessage) {
    treeContent = (
      <div className="flex flex-col items-center gap-2 px-3 py-6 text-center text-xs text-destructive">
        <CircleDashed aria-hidden="true" className="size-6" />
        <p>{errorMessage}</p>
      </div>
    );
  } else {
    treeContent = (
      <NoteTree
        expandedIds={expandedIds}
        nodes={notes}
        onDelete={setDeleteTarget}
        onCreate={(mode, parentId) => {
          setCreateParentId(parentId);
          setCreateMode(mode);
        }}
        onRename={setRenameTarget}
        onSelect={(node) => setSelectedId(node.id)}
        onToggleExpand={handleToggleExpand}
        selectedId={selectedId}
      />
    );
  }

  return (
    <>
      <div className="flex h-[600px] overflow-hidden rounded-lg border bg-card">
        <aside className="flex w-72 shrink-0 flex-col border-r">
          <div className="flex items-center justify-between gap-1 border-b px-3 py-2.5">
            <span className="text-sm font-semibold">Notes</span>
            <div className="flex gap-1">
              <Button
                aria-label="New folder"
                className="hover:text-primary"
                onClick={() => {
                  setCreateParentId(null);
                  setCreateMode("folder");
                }}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <FolderPlus aria-hidden="true" />
              </Button>
              <Button
                aria-label="New note"
                className="hover:text-primary"
                onClick={() => {
                  setCreateParentId(null);
                  setCreateMode("file");
                }}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <FilePlus aria-hidden="true" />
              </Button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">{treeContent}</div>
        </aside>

        <section className="min-w-0 flex-1">
          <NoteEditor note={selectedNote} onSaved={reload} projectId={projectId} />
        </section>
      </div>

      <NoteNameDialog
        confirmLabel="Create"
        label={createMode === "folder" ? "Folder name" : "Note title"}
        onOpenChange={(open) => {
          if (!open) {
            setCreateMode(null);
            setCreateParentId(null);
          }
        }}
        onSubmit={handleCreate}
        open={createMode !== null}
        placeholder={createMode === "folder" ? "Folder name" : "Note title"}
        title={createMode === "folder" ? "New folder" : "New note"}
      />

      <NoteNameDialog
        confirmLabel="Rename"
        initialValue={renameTarget?.title}
        label={renameTarget?.type === "folder" ? "Folder name" : "Note title"}
        onOpenChange={(open) => {
          if (!open) {
            setRenameTarget(null);
          }
        }}
        onSubmit={handleRename}
        open={renameTarget !== null}
        title="Rename"
      />

      <DeleteConfirmDialog
        onConfirm={handleDelete}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        open={deleteTarget !== null}
        title={deleteTarget?.type === "folder" ? "Delete folder" : "Delete note"}
      >
        Are you sure you want to delete {deleteTarget?.title}?
        {deleteTarget?.type === "folder" ? (
          <>
            {" "}
            <br />
            All notes inside it will be deleted too.
          </>
        ) : null}{" "}
        <br />
        This action cannot be undone.
      </DeleteConfirmDialog>
    </>
  );
};
