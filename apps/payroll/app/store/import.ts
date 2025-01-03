import type {
  ImportEmployeeDataType,
  ImportReimbursementDataType,
} from "@canny_ecosystem/supabase/queries";
import { create } from "zustand";

type ImportStateForReimbursement = {
  importData: { data: ImportReimbursementDataType[] };
  setImportData: (importData: { data: ImportReimbursementDataType[] }) => void;
};

export const useImportStoreForReimbursement =
  create<ImportStateForReimbursement>()((set) => ({
    importData: { data: [] },
    setImportData: (importData) => set({ importData }),
  }));



  
type ImportStateForEmployee = {
  importData: { data: ImportEmployeeDataType[] };
  setImportData: (importData: { data: ImportEmployeeDataType[] }) => void;
};

export const useImportStoreForEmployee = create<ImportStateForEmployee>()(
  (set) => ({
    importData: { data: [] },
    setImportData: (importData) => set({ importData }),
  })
);
