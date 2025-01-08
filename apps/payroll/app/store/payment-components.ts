import type {
  EmployeeStateInsuranceDataType,
  PaymentFieldDataType,
  StatutoryBonusDataType,
} from "@canny_ecosystem/supabase/queries";
import type {
  EmployeeProvidentFundDatabaseRow,
  LabourWelfareFundDatabaseRow,
  ProfessionalTaxDatabaseRow,
} from "@canny_ecosystem/supabase/types";
import { create } from "zustand";

type StatutoryFieldsType = {
  epf?: Omit<
    EmployeeProvidentFundDatabaseRow,
    "created_at" | "updated_at"
  > | null;
  esi?: EmployeeStateInsuranceDataType | null;
  bonus?: StatutoryBonusDataType | null;
  pt?: Omit<ProfessionalTaxDatabaseRow, "created_at" | "updated_at"> | null;
  lwf?: Omit<LabourWelfareFundDatabaseRow, "created_at" | "updated_at"> | null;
};

interface PaymentComponentsState {
  valueForEPF: { [key: string]: number };
  setValueForEPF: (valueForEPF: { [key: string]: number }) => void;
  valueForESI: { [key: string]: number };
  setValueForESI: (valueForESI: { [key: string]: number }) => void;
  grossValue: { [key: string]: number };
  setGrossValue: (grossValue: { [key: string]: number }) => void;
  basicValue: number;
  setBasicValue: (basicValue: number) => void;
  selectedPaymentFields: PaymentFieldDataType[];
  setSelectedPaymentFields: (
    selectedPaymentFields: PaymentFieldDataType[],
  ) => void;
  selectedStatutoryFields: StatutoryFieldsType;
  setSelectedStatutoryFields: (
    selectedStatutoryFields: StatutoryFieldsType,
  ) => void;
}

export const usePaymentComponentsStore = create<PaymentComponentsState>()(
  (set) => ({
    valueForEPF: {},
    setValueForEPF: (valueForEPF) => set({ valueForEPF }),
    valueForESI: {},
    setValueForESI: (valueForESI) => set({ valueForESI }),
    grossValue: {},
    setGrossValue: (grossValue) => set({ grossValue }),
    basicValue: 0,
    setBasicValue: (basicValue) => set({ basicValue }),
    selectedPaymentFields: [],
    setSelectedPaymentFields: (selectedPaymentFields) =>
      set({ selectedPaymentFields }),
    selectedStatutoryFields: {},
    setSelectedStatutoryFields: (selectedStatutoryFields) =>
      set({ selectedStatutoryFields }),
  }),
);
