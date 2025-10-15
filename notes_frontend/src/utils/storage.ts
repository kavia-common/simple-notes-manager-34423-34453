export type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
};

const STORAGE_KEY = 'notes_v1';

// PUBLIC_INTERFACE
export function loadNotes(): Note[] {
  /** Loads notes from localStorage; returns an array of notes. */
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Note[];
    if (!Array.isArray(parsed)) return [];
    return parsed.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

// PUBLIC_INTERFACE
export function saveNotes(notes: Note[]): void {
  /** Persists notes array to localStorage. */
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

// PUBLIC_INTERFACE
export function upsertNote(notes: Note[], note: Note): Note[] {
  /** Inserts or updates a note in the provided array and returns new array. */
  const idx = notes.findIndex(n => n.id === note.id);
  const now = Date.now();
  const updated: Note = { ...note, updatedAt: now };
  if (idx >= 0) {
    const copy = [...notes];
    copy[idx] = updated;
    saveNotes(copy);
    return copy;
  }
  const copy = [updated, ...notes];
  saveNotes(copy);
  return copy;
}

// PUBLIC_INTERFACE
export function deleteNote(notes: Note[], id: string): Note[] {
  /** Deletes a note by id and returns new array. */
  const copy = notes.filter(n => n.id !== id);
  saveNotes(copy);
  return copy;
}

// PUBLIC_INTERFACE
export function createNote(): Note {
  /** Creates a new empty note object. */
  const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2);
  return {
    id,
    title: 'Untitled',
    content: '',
    updatedAt: Date.now(),
  };
}

// PUBLIC_INTERFACE
export function debounce<T extends (...args: any[]) => void>(fn: T, wait = 300): T {
  /** Returns a debounced function. */
  let t: number | undefined;
  return function(this: any, ...args: any[]) {
    if (t) window.clearTimeout(t);
    t = window.setTimeout(() => fn.apply(this, args), wait);
  } as T;
}
