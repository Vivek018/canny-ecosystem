import type {
  ImportEmployeeDetailsDataType,
  ImportEmployeeStatutoryDataType,
  ImportEmployeeBankDetailsDataType,
  ImportEmployeeAddressDataType,
  ImportEmployeeGuardiansDataType,
  ImportReimbursementDataType,
  ImportEmployeeAttendanceDataType,
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

type ImportStateForEmployeeDetails = {
  importData: { data: ImportEmployeeDetailsDataType[] };
  setImportData: (importData: {
    data: ImportEmployeeDetailsDataType[];
  }) => void;
};

export const useImportStoreForEmployeeDetails =
  create<ImportStateForEmployeeDetails>()((set) => ({
    importData: { data: [] },
    setImportData: (importData) => set({ importData }),
  }));

type ImportStateForEmployeeStatutory = {
  importData: { data: ImportEmployeeStatutoryDataType[] };
  setImportData: (importData: {
    data: ImportEmployeeStatutoryDataType[];
  }) => void;
};

export const useImportStoreForEmployeeStatutory =
  create<ImportStateForEmployeeStatutory>()((set) => ({
    importData: { data: [] },
    setImportData: (importData) => set({ importData }),
  }));

type ImportStateForEmployeeForBankDetails = {
  importData: { data: ImportEmployeeBankDetailsDataType[] };
  setImportData: (importData: {
    data: ImportEmployeeBankDetailsDataType[];
  }) => void;
};

export const useImportStoreForEmployeeBankDetails =
  create<ImportStateForEmployeeForBankDetails>()((set) => ({
    importData: { data: [] },
    setImportData: (importData) => set({ importData }),
  }));

type ImportStateForEmployeeForAddress = {
  importData: { data: ImportEmployeeAddressDataType[] };
  setImportData: (importData: {
    data: ImportEmployeeAddressDataType[];
  }) => void;
};

export const useImportStoreForEmployeeAddress =
  create<ImportStateForEmployeeForAddress>()((set) => ({
    importData: { data: [] },
    setImportData: (importData) => set({ importData }),
  }));

type ImportStateForEmployeeForGuardians = {
  importData: { data: ImportEmployeeGuardiansDataType[] };
  setImportData: (importData: {
    data: ImportEmployeeGuardiansDataType[];
  }) => void;
};

export const useImportStoreForEmployeeGuardians =
  create<ImportStateForEmployeeForGuardians>()((set) => ({
    importData: { data: [] },
    setImportData: (importData) => set({ importData }),
  }));

type ImportStateForEmployeeForAttendance = {
  importData: { data: ImportEmployeeAttendanceDataType[] };
  setImportData: (importData: {
    data: ImportEmployeeAttendanceDataType[];
  }) => void;
};

export const useImportStoreForEmployeeAttendance =
  create<ImportStateForEmployeeForAttendance>()((set) => ({
    importData: { data: [] },
    setImportData: (importData) => set({ importData }),
  }));
