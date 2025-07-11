
import type { SalaryEntriesDatabaseRow } from "@canny_ecosystem/supabase/types";
import type { RowSelectionState, Updater } from "@tanstack/react-table";
import { create } from "zustand";

interface SalaryEntriesState {
  setRowSelection: (updater: Updater<RowSelectionState>) => void;
  rowSelection: Record<string, boolean>;
  selectedRows: SalaryEntriesDatabaseRow[];
  setSelectedRows: (updater: Updater<SalaryEntriesDatabaseRow[]>) => void;
}

export const useSalaryEntriesStore = create<SalaryEntriesState>()((set) => ({
  rowSelection: {},
  selectedRows: [],
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
