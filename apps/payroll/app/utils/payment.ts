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
import {
  componentTypeArray,
  EMPLOYEE_RESTRICTED_VALUE,
  ESI_EMPLOYEE_CONTRIBUTION,
} from "@canny_ecosystem/utils";
import { EMPLOYEE_EPF_PERCENTAGE } from "@canny_ecosystem/utils/constant";

export function getSelectedPaymentComponentFromField<
  T extends PaymentFieldDataType,
>({ field, monthlyCtc }: { field: T | undefined | null; monthlyCtc: number }) {
  if (!field) return null;

  let calculationValue = null;

  if (field.payment_type === "fixed") {
    if (field.calculation_type === "fixed" && field.amount) {
      calculationValue = field.amount ?? 0;
    }
    if (field.calculation_type === "percentage_of_ctc" && monthlyCtc) {
      calculationValue = (monthlyCtc * (field.amount ?? 0)) / 100;
    }
  } else if (field.payment_type === "variable") {
    if (field.calculation_type === "fixed") {
      calculationValue = field.amount ?? 0;
    }
  }

  return {
    payment_field_id: field.id,
    payment_field: {
      name: field.name,
      calculation_type: field.calculation_type,
      payment_type: field.payment_type,
      amount: field.amount,
    },
    component_type: componentTypeArray[0],
    calculation_value: calculationValue ?? field.amount,
  };
}

export function getEPFComponentFromField<
  T extends Omit<EmployeeProvidentFundDatabaseRow, "created_at" | "updated_at">,
>({ field, value }: { field: T | undefined | null; value: number }) {
  if (!field) return null;

  let maxValue = value;

  if (field.restrict_employee_contribution) {
    maxValue = field.employee_restrict_value ?? EMPLOYEE_RESTRICTED_VALUE;
  }

  const calculationValue =
    maxValue * (field.employee_contribution ?? EMPLOYEE_EPF_PERCENTAGE);

  return {
    epf_id: field.id,
    epf: {
      epf_number: field.epf_number,
      deduction_cycle: field.deduction_cycle,
      employee_contribution: field.employee_contribution,
      employer_contribution: field.employer_contribution,
      employee_restrict_value: field.employee_restrict_value,
      employer_restrict_value: field.employer_restrict_value,
      restrict_employee_contribution: field.restrict_employee_contribution,
      restrict_employer_contribution: field.restrict_employer_contribution,
      include_employer_contribution: field.include_employer_contribution,
      edli_restrict_value: field.edli_restrict_value,
      include_employer_edli_contribution:
        field.include_employer_edli_contribution,
      include_admin_charges: field.include_admin_charges,
    },
    component_type: "statutory_contribution",
    calculation_value: calculationValue.toFixed(2),
  };
}

export function getESIComponentFromField<
  T extends EmployeeStateInsuranceDataType,
>({ field, value }: { field: T | null | undefined; value: number }) {
  if (!field) return null;

  const calculationValue =
    value * (field.employees_contribution ?? ESI_EMPLOYEE_CONTRIBUTION);

  return {
    esi_id: field.id,
    esi: {
      esi_number: field.esi_number,
      deduction_cycle: field.deduction_cycle,
      employees_contribution: field.employees_contribution,
      employers_contribution: field.employers_contribution,
      include_employer_contribution: field.include_employer_contribution,
    },
    component_type: "statutory_contribution",
    calculation_value: calculationValue.toFixed(2),
  };
}

export function getPTComponentFromField<
  T extends Omit<
    ProfessionalTaxDatabaseRow,
    "gross_salary_range" | "created_at" | "updated_at"
  > & {
    gross_salary_range: any;
  },
>({ field, value }: { field: T | null | undefined; value: number }) {
  if (!field) return null;

  if (!field.gross_salary_range?.length) return null;

  let calculationValue = 0;

  for (const range of JSON.parse(field.gross_salary_range)) {
    if (range.start <= value && value <= range.end) {
      calculationValue = range.value;
      break;
    }
  }

  return {
    pt_id: field.id,
    pt: {
      pt_number: field.pt_number,
      state: field.state,
      deduction_cycle: field.deduction_cycle,
    },
    component_type: "statutory_contribution",
    calculation_value: calculationValue,
  };
}

export function getLWFComponentFromField<
  T extends Omit<LabourWelfareFundDatabaseRow, "created_at" | "updated_at">,
>({ field }: { field: T | null | undefined }) {
  if (!field) return null;

  let calculationValue = 0;

  if (field.deduction_cycle === "monthly") {
    calculationValue = field.employee_contribution ?? 0;
  } else if (field.deduction_cycle === "yearly") {
    calculationValue = (field.employee_contribution ?? 0) / 12;
  } else if (field.deduction_cycle === "half_yearly") {
    calculationValue = (field.employee_contribution ?? 0) / 6;
  } else if (field.deduction_cycle === "quarterly") {
    calculationValue = (field.employee_contribution ?? 0) / 3;
  }

  return {
    lwf_id: field.id,
    lwf: {
      name: "Labour Welfare Fund",
      state: field.state,
      employee_contribution: field.employee_contribution,
      employer_contribution: field.employer_contribution,
      deduction_cycle: field.deduction_cycle,
    },
    component_type: "statutory_contribution",
    calculation_value: calculationValue,
  };
}

export function getBonusComponentFromField<T extends StatutoryBonusDataType>({
  field,
  value,
}: { field: T | null | undefined; value: number }) {
  if (!field) return null;

  let calculationValue = 0;

  if (field.percentage) {
    calculationValue = (field.percentage * value) / 100;
  }

  return {
    bonus_id: field.id,
    bonus: {
      name: "Bonus",
      payment_frequency: field.payment_frequency,
      percentage: field.percentage,
      payout_month: field.payout_month,
    },
    component_type: "bonus",
    calculation_value: calculationValue.toFixed(2),
  };
}
