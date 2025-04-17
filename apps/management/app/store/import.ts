import type {
  ImportEmployeeDetailsDataType,
  ImportEmployeeStatutoryDataType,
  ImportEmployeeBankDetailsDataType,
  ImportEmployeeAddressDataType,
  ImportEmployeeGuardiansDataType,
  ImportReimbursementDataType,
  ImportEmployeeAttendanceDataType,
  ImportExitDataType,
  ImportLeavesDataType,
  ImportPayrollDataType,
  ImportSalaryPayrollDataType,
  ImportEmployeeAttendanceByPresentsDataType,
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
type ImportStateForExit = {
  importData: { data: ImportExitDataType[] };
  setImportData: (importData: { data: ImportExitDataType[] }) => void;
};

export const useImportStoreForExit = create<ImportStateForExit>()((set) => ({
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

type ImportStateForLeaves = {
  importData: { data: ImportLeavesDataType[] };
  setImportData: (importData: { data: ImportLeavesDataType[] }) => void;
};

export const useImportStoreForLeaves = create<ImportStateForLeaves>()(
  (set) => ({
    importData: { data: [] },
    setImportData: (importData) => set({ importData }),
  })
);

type ImportStateForPayroll = {
  importData: { data: ImportPayrollDataType[] };
  setImportData: (importData: { data: ImportPayrollDataType[] }) => void;
};
export const useImportStoreForPayroll = create<ImportStateForPayroll>()(
  (set) => ({
    importData: { data: [] },
    setImportData: (importData) => set({ importData }),
  })
);

type ImportStateForSalaryPayroll = {
  importData: { data: ImportSalaryPayrollDataType[] };
  setImportData: (importData: { data: ImportSalaryPayrollDataType[] }) => void;
};
export const useImportStoreForSalaryPayroll =
  create<ImportStateForSalaryPayroll>()((set) => ({
    importData: { data: [] },
    setImportData: (importData) => set({ importData }),
  }));

type ImportStateForEmployeeForAttendanceByPresents = {
  importData: { data: ImportEmployeeAttendanceByPresentsDataType[] };
  setImportData: (importData: {
    data: ImportEmployeeAttendanceByPresentsDataType[];
  }) => void;
};

export const useImportStoreForEmployeeAttendanceByPresents =
  create<ImportStateForEmployeeForAttendanceByPresents>()((set) => ({
    importData: { data: [] },
    setImportData: (importData) => set({ importData }),
  }));
