import type { TransformedAttendanceDataType } from "@/routes/_protected+/time-tracking+/attendance+/_index";
import type { RowSelectionState, Updater } from "@tanstack/react-table";
import { create } from "zustand";


interface AttendanceState {
  columns: string[];
  setColumns: (columns?: any[]) => void;
  setRowSelection: (updater: Updater<RowSelectionState>) => void;
  rowSelection: Record<string, boolean>;
  selectedRows: TransformedAttendanceDataType[];
  setSelectedRows: (updater: Updater<TransformedAttendanceDataType[]>) => void;
}

export const useAttendanceStore = create<AttendanceState>()((set) => ({
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
