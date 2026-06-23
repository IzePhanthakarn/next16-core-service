import type { Note } from "@/modules/core/projects/models";

/** Finds a note anywhere in the nested tree by id. */
export const findNoteById = (notes: Note[], id: string): Note | null => {
  for (const note of notes) {
    if (note.id === id) {
      return note;
    }

    const found = findNoteById(note.children, id);
    if (found) {
      return found;
    }
  }

  return null;
};
