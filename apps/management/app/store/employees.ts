import type { EmployeeDataType } from "@canny_ecosystem/supabase/queries";
import type { RowSelectionState, Updater } from "@tanstack/react-table";
import { create } from "zustand";

interface EmployeesState {
  columns: string[];
  columnVisibility: any;
  setColumnVisibility: any;
  setColumns: (columns?: any[]) => void;
  setRowSelection: (updater: Updater<RowSelectionState>) => void;
  rowSelection: Record<string, boolean>;
  selectedRows: EmployeeDataType[];
  setSelectedRows: (updater: Updater<EmployeeDataType[]>) => void;
}

export const useEmployeesStore = create<EmployeesState>()((set) => ({
  columns: [],
  rowSelection: {},
  selectedRows: [],
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
