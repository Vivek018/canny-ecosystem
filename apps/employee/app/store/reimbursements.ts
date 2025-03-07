import type { ReimbursementDataType } from "@canny_ecosystem/supabase/queries";
import type { RowSelectionState, Updater } from "@tanstack/react-table";
import { create } from "zustand";

interface ReimbursementState {
  columns: string[];
  setColumns: (columns?: any[]) => void;
  setRowSelection: (updater: Updater<RowSelectionState>) => void;
  rowSelection: Record<string, boolean>;
  selectedRows: ReimbursementDataType[];
  setSelectedRows: (updater: Updater<ReimbursementDataType[]>) => void;
}

export const useReimbursementStore = create<ReimbursementState>()((set) => ({
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
