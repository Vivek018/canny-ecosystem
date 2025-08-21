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
  ImportSalaryPayrollDataType,
  ImportEmployeeProjectAssignmentsDataType,
  ImportVehicleUsageDataType,
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

type ImportStateForEmployeeProjectAssignments = {
  importData: { data: ImportEmployeeProjectAssignmentsDataType[] };
  setImportData: (importData: {
    data: ImportEmployeeProjectAssignmentsDataType[];
  }) => void;
};

export const useImportStoreForEmployeeProjectAssignments =
  create<ImportStateForEmployeeProjectAssignments>()((set) => ({
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
  }),
);

type ImportStateForReimbursementPayroll = {
  importData: {
    title: string;
    data: ImportReimbursementDataType[];
  };
  setImportData: (importData: {
    title: string;
    data: ImportReimbursementDataType[];
  }) => void;
};
export const useImportStoreForReimbursementPayroll =
  create<ImportStateForReimbursementPayroll>()((set) => ({
    importData: { title: "", data: [] },
    setImportData: (importData) => set({ importData }),
  }));

type ImportStateForExitPayroll = {
  importData: {
    title: string;
    data: ImportExitDataType[];
  };
  setImportData: (importData: {
    title: string;
    data: ImportExitDataType[];
  }) => void;
};
export const useImportStoreForExitPayroll = create<ImportStateForExitPayroll>()(
  (set) => ({
    importData: { title: "", data: [] },
    setImportData: (importData) => set({ importData }),
  }),
);

type ImportStateForSalaryPayroll = {
  importData: {
    title?: string;
    site_id?: string;
    project_id?: string;
    data: ImportSalaryPayrollDataType[];
  };
  setImportData: (importData: {
    title?: string;
    site_id?: string;
    project_id?: string;
    data: ImportSalaryPayrollDataType[];
  }) => void;
};

export const useImportStoreForSalaryPayroll =
  create<ImportStateForSalaryPayroll>()((set) => ({
    importData: {
      title: "",
      site_id: "",
      project_id: "",
      data: [],
    },
    setImportData: (importData) => set({ importData }),
  }));

type ImportStateForAttendance = {
  importData: { data: ImportEmployeeAttendanceDataType[] };
  setImportData: (importData: {
    data: ImportEmployeeAttendanceDataType[];
  }) => void;
};

export const useImportStoreForAttendance = create<ImportStateForAttendance>()(
  (set) => ({
    importData: { data: [] },
    setImportData: (importData) => set({ importData }),
  }),
);

type ImportStateForVehicleUsage = {
  importData: { data: ImportVehicleUsageDataType[] };
  setImportData: (importData: { data: ImportVehicleUsageDataType[] }) => void;
};

export const useImportStoreForVehicleUsage =
  create<ImportStateForVehicleUsage>()((set) => ({
    importData: { data: [] },
    setImportData: (importData) => set({ importData }),
  }));
