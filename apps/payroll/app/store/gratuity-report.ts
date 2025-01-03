import type { EmployeeDataType } from "@canny_ecosystem/supabase/queries";
import type { RowSelectionState, Updater } from "@tanstack/react-table";
import { create } from "zustand";

interface GratuityReportState {
  columns: string[];
  setColumns: (columns?: any[]) => void;
  setRowSelection: (updater: Updater<RowSelectionState>) => void;
  rowSelection: Record<string, boolean>;
  selectedRows: EmployeeDataType[];
  setSelectedRows: (updater: Updater<EmployeeDataType[]>) => void;
}

export const useGratuityReportStore = create<GratuityReportState>()((set) => ({
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
  selectedRows: [],
  setSelectedRows: (updater: Updater<EmployeeDataType[]>) =>
    set((state) => {
      return {
        selectedRows:
          typeof updater === "function" ? updater(state.selectedRows) : updater,
      };
    }),
}));