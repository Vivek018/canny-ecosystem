import type { RowSelectionState, Updater } from "@tanstack/react-table";
import { create } from "zustand";

interface AttendanceState {
  columns: string[];
  columnVisibility: any;
  setColumnVisibility: any;
  setColumns: (columns?: any[]) => void;
  setRowSelection: (updater: Updater<RowSelectionState>) => void;
  rowSelection: Record<string, boolean>;
  selectedRows: any[];
  setSelectedRows: (updater: Updater<any[]>) => void;
}

export const useAttendanceStore = create<AttendanceState>()((set) => ({
  columns: [],
  rowSelection: {},
  selectedRows: [],
  columnVisibility: {},
  setColumnVisibility: (
    updater: any[] | ((arg0: any[]) => any[] | undefined) | undefined,
  ) =>
    set((state) => {
      return {
        columnVisibility:
          typeof updater === "function"
            ? updater(state.columnVisibility)
            : updater,
      };
    }),

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
