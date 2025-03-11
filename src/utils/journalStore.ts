
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  energy: number;
  productivity: number;
  createdAt: number;
}

interface JournalState {
  entries: JournalEntry[];
  activeEntryId: string | null;
  addEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => void;
  updateEntry: (id: string, entry: Partial<JournalEntry>) => void;
  deleteEntry: (id: string) => void;
  setActiveEntry: (id: string | null) => void;
  getEntryById: (id: string) => JournalEntry | undefined;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: [],
      activeEntryId: null,
      addEntry: (entry) => {
        const id = crypto.randomUUID();
        const newEntry = {
          ...entry,
          id,
          createdAt: Date.now(),
        };
        set((state) => ({
          entries: [newEntry, ...state.entries],
          activeEntryId: id,
        }));
        return id;
      },
      updateEntry: (id, updatedEntry) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id ? { ...entry, ...updatedEntry } : entry
          ),
        }));
      },
      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
          activeEntryId: state.activeEntryId === id ? null : state.activeEntryId,
        }));
      },
      setActiveEntry: (id) => {
        set({ activeEntryId: id });
      },
      getEntryById: (id) => {
        return get().entries.find((entry) => entry.id === id);
      },
    }),
    {
      name: 'journal-storage',
    }
  )
);
