import type { CasesDatabaseRow } from "@canny_ecosystem/supabase/types";
import type { RowSelectionState, Updater } from "@tanstack/react-table";
import { create } from "zustand";

interface CaseState {
  columns: string[];
  setColumns: (columns?: any[]) => void;
  setRowSelection: (updater: Updater<RowSelectionState>) => void;
  rowSelection: Record<string, boolean>;
  selectedRows: Omit<CasesDatabaseRow, "created_at" | "updated_at">[];
  setSelectedRows: (
    updater: Updater<Omit<CasesDatabaseRow, "created_at" | "updated_at">[]>,
  ) => void;
}

export const useCaseStore = create<CaseState>()((set) => ({
  columns: [],
  rowSelection: {},
  selectedRows: [],
  setColumns: (columns) => set({ columns }),
  setRowSelection: (updater: Updater<RowSelectionState>) =>
    set((state) => {
      return {
        rowSelection:
          typeof updater === "function" ? updater(state.rowSelection) : updater,
      };
    }),
  setSelectedRows: (updater) =>
    set((state) => {
      return {
        selectedRows:
          typeof updater === "function" ? updater(state.selectedRows) : updater,
      };
    }),
}));
