import type {
  ImportEmployeePersonalsDataType,
  ImportEmployeeStatutoryDataType,
  ImportEmployeeBankingDataType,
  ImportEmployeeAddressDataType,
  ImportEmployeeGuardiansDataType,
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


type ImportStateForEmployeePersonals = {
  importData: { data: ImportEmployeePersonalsDataType[] };
  setImportData: (importData: {
    data: ImportEmployeePersonalsDataType[];
  }) => void;
};

export const useImportStoreForEmployeePersonals =
  create<ImportStateForEmployeePersonals>()((set) => ({
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


type ImportStateForEmployeeForBanking = {
  importData: { data: ImportEmployeeBankingDataType[] };
  setImportData: (importData: {
    data: ImportEmployeeBankingDataType[];
  }) => void;
};

export const useImportStoreForEmployeeBanking =
  create<ImportStateForEmployeeForBanking>()((set) => ({
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


  