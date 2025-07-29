import type { LeavesDataType } from "@canny_ecosystem/supabase/queries";
import type { RowSelectionState, Updater } from "@tanstack/react-table";
import { create } from "zustand";

interface LeavesState {
  columns: string[];
  setColumns: (columns?: any[]) => void;
  columnVisibility: any;
  setColumnVisibility: any;
  setRowSelection: (updater: Updater<RowSelectionState>) => void;
  rowSelection: Record<string, boolean>;
  selectedRows: LeavesDataType[];
  setSelectedRows: (updater: Updater<LeavesDataType[]>) => void;
}

export const useLeavesStore = create<LeavesState>()((set) => ({
  columns: [],
  rowSelection: {},
  selectedRows: [],
  setColumns: (columns) => set({ columns }),
  columnVisibility: {},
  setColumnVisibility: (updater: (arg0: any) => any) =>
    set((state) => {
      return {
        columnVisibility:
          typeof updater === "function"
            ? updater(state.columnVisibility)
            : updater,
      };
    }),
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
