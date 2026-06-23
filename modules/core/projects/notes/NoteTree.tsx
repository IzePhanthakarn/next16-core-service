"use client";

import {
  ChevronDown,
  ChevronRight,
  EllipsisVertical,
  FileText,
  Folder,
  FolderPlus,
  FolderOpen,
  FilePlus,
} from "lucide-react";

import { UilPen } from "@/assets/icons/UilPen";
import { UilTrashAlt } from "@/assets/icons/UilTrashAlt";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Note } from "@/modules/core/projects/models";

type NoteTreeProps = {
  nodes: Note[];
  selectedId: string | null;
  expandedIds: Set<string>;
  depth?: number;
  onSelect: (node: Note) => void;
  onToggleExpand: (id: string) => void;
  onCreate: (mode: "folder" | "file", parentId: string) => void;
  onRename: (node: Note) => void;
  onDelete: (node: Note) => void;
};

export const NoteTree = ({
  nodes,
  selectedId,
  expandedIds,
  depth = 0,
  onSelect,
  onToggleExpand,
  onCreate,
  onRename,
  onDelete,
}: NoteTreeProps) => {
  if (nodes.length === 0 && depth === 0) {
    return (
      <p className="px-2 py-3 text-xs text-muted-foreground">
        No notes yet. Create a folder or note to get started.
      </p>
    );
  }

  return (
    <ul className={cn(depth > 0 && "ml-3 border-l border-border/60 pl-1")}>
      {nodes.map((node) => {
        const isExpanded = expandedIds.has(node.id);
        const isSelected = selectedId === node.id;

        return (
          <li key={node.id}>
            <div
              className={cn(
                "group flex items-center gap-1 rounded-md pr-1 transition-colors hover:bg-muted/60",
                isSelected && "bg-muted"
              )}
            >
              <button
                className="flex min-w-0 flex-1 items-center gap-1.5 py-1.5 pl-1 text-left text-sm outline-none"
                onClick={() => {
                  if (node.type === "folder") {
                    onToggleExpand(node.id);
                  }
                  onSelect(node);
                }}
                type="button"
              >
                {node.type === "folder" ? (
                  <>
                    {isExpanded ? (
                      <ChevronDown aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
                    )}
                    {isExpanded ? (
                      <FolderOpen aria-hidden="true" className="size-4 shrink-0 text-primary" />
                    ) : (
                      <Folder aria-hidden="true" className="size-4 shrink-0 text-primary" />
                    )}
                  </>
                ) : (
                  <FileText aria-hidden="true" className="ml-[1.125rem] size-4 shrink-0 text-muted-foreground" />
                )}
                <span className="truncate" title={node.title}>
                  {node.title}
                </span>
              </button>

              {node.type === "folder" ? (
                <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  <Button
                    aria-label={`New folder in ${node.title}`}
                    className="size-6 hover:text-primary"
                    onClick={() => onCreate("folder", node.id)}
                    size="icon-xs"
                    type="button"
                    variant="ghost"
                  >
                    <FolderPlus aria-hidden="true" />
                  </Button>
                  <Button
                    aria-label={`New note in ${node.title}`}
                    className="size-6 hover:text-primary"
                    onClick={() => onCreate("file", node.id)}
                    size="icon-xs"
                    type="button"
                    variant="ghost"
                  >
                    <FilePlus aria-hidden="true" />
                  </Button>
                </div>
              ) : null}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    aria-label={`${node.title} actions`}
                    className="size-6 shrink-0 opacity-0 group-hover:opacity-100 aria-expanded:opacity-100"
                    size="icon-xs"
                    type="button"
                    variant="ghost"
                  >
                    <EllipsisVertical aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => onRename(node)}>
                    <UilPen aria-hidden="true" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => onDelete(node)}
                    variant="destructive"
                  >
                    <UilTrashAlt aria-hidden="true" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {node.type === "folder" && isExpanded && node.children.length > 0 ? (
              <NoteTree
                depth={depth + 1}
                expandedIds={expandedIds}
                nodes={node.children}
                onDelete={onDelete}
                onCreate={onCreate}
                onRename={onRename}
                onSelect={onSelect}
                onToggleExpand={onToggleExpand}
                selectedId={selectedId}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
};
