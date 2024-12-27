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
    selectedPaymentFields: [],
    setSelectedPaymentFields: (selectedPaymentFields) =>
      set({ selectedPaymentFields }),
    selectedStatutoryFields: {},
    setSelectedStatutoryFields: (selectedStatutoryFields) =>
      set({ selectedStatutoryFields }),
  }),
);
