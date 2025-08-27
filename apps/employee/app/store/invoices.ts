import type { InvoiceDataType } from "@canny_ecosystem/supabase/queries";
import type { RowSelectionState, Updater } from "@tanstack/react-table";
import { create } from "zustand";

interface InvoiceState {
  columns: string[];
  columnVisibility: any;
  setColumnVisibility: any;
  setColumns: (columns?: any[]) => void;
  setRowSelection: (updater: Updater<RowSelectionState>) => void;
  rowSelection: Record<string, boolean>;
  selectedRows: InvoiceDataType[];
  setSelectedRows: (updater: Updater<InvoiceDataType[]>) => void;
}

export const useInvoiceStore = create<InvoiceState>()((set) => ({
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
