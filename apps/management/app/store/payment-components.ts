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
    "created_at" 
  > | null;
  esi?: EmployeeStateInsuranceDataType | null;
  bonus?: StatutoryBonusDataType | null;
  pt?: Omit<ProfessionalTaxDatabaseRow, "created_at" > | null;
  lwf?: Omit<LabourWelfareFundDatabaseRow, "created_at" > | null;
};

interface PaymentComponentsState {
  valueForEPF: { [key: string]: number };
  setValueForEPF: (fieldId: string, value: number) => void;
  valueForESI: { [key: string]: number };
  setValueForESI: (fieldId: string, value: number) => void;
  grossValue: { [key: string]: number };
  setGrossValue: (fieldId: string, value: number) => void;
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
    setValueForEPF: (fieldId, value) =>
      set((state) => {
        const updatedEPF = { ...state.valueForEPF, [fieldId]: value };
        return { valueForEPF: updatedEPF };
      }),
    valueForESI: {},
    setValueForESI: (fieldId, value) =>
      set((state) => {
        const updatedESI = { ...state.valueForESI, [fieldId]: value };
        return { valueForESI: updatedESI };
      }),
    grossValue: {},
    setGrossValue: (fieldId, value) =>
      set((state) => {
        const updatedGross = { ...state.grossValue, [fieldId]: value };
        return { grossValue: updatedGross };
      }),
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
