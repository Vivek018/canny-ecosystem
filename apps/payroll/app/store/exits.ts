import type { RowSelectionState, Updater } from "@tanstack/react-table";
import { create } from "zustand";

interface ExitsState {
  columns: string[];
  setColumns: (columns?: any[]) => void;
  setRowSelection: (updater: Updater<RowSelectionState>) => void;
  rowSelection: Record<string, boolean>;
}

export const useExitsStore = create<ExitsState>()((set) => ({
  columns: [],
  rowSelection: {},
  setColumns: (columns) => set({ columns }),
  setRowSelection: (updater: Updater<RowSelectionState>) =>
    set((state) => {
      return {
        rowSelection:
          typeof updater === "function" ? updater(state.rowSelection) : updater,
      };
    }),
}));
