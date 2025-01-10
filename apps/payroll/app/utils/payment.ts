import type {
  EmployeeStateInsuranceDataType,
  PaymentFieldDataType,
  StatutoryBonusDataType,
} from "@canny_ecosystem/supabase/queries";
import type {
  EmployeeProvidentFundDatabaseRow,
  LabourWelfareFundDatabaseRow,
  PaymentTemplateComponentDatabaseRow,
  ProfessionalTaxDatabaseRow,
} from "@canny_ecosystem/supabase/types";
import {
  componentTypeArray,
  EMPLOYEE_RESTRICTED_VALUE,
  ESI_EMPLOYEE_CONTRIBUTION,
  ESI_MAX_LIMIT,
} from "@canny_ecosystem/utils";
import { EMPLOYEE_EPF_PERCENTAGE } from "@canny_ecosystem/utils/constant";

export function getSelectedPaymentComponentFromField<
  T extends PaymentFieldDataType,
>({
  field,
  monthlyCtc,
  priortizedComponent,
  existingComponent,
}: {
  field: T | undefined | null;
  monthlyCtc: number;
  priortizedComponent?:
    | Omit<PaymentTemplateComponentDatabaseRow, "created_at" | "updated_at">
    | null
    | undefined;
  existingComponent?: Omit<
    PaymentTemplateComponentDatabaseRow,
    "created_at" | "updated_at"
  >;
}) {
  if (!field) return null;

  let calculationValue = null;

  if (field.payment_type === "fixed") {
    if (field.calculation_type === "fixed" && field.amount) {
      calculationValue = field.amount;
    }
    if (field.calculation_type === "percentage_of_ctc") {
      calculationValue = (monthlyCtc * (field.amount ?? 0)) / 100;
    }
  }

  return {
    id: priortizedComponent?.id ?? existingComponent?.id,
    template_id:
      priortizedComponent?.template_id ?? existingComponent?.template_id,
    payment_field_id:
      priortizedComponent?.payment_field_id ??
      field.id ??
      existingComponent?.payment_field_id,
    target_type: priortizedComponent?.target_type ?? "payment_field",
    component_type:
      priortizedComponent?.component_type ??
      existingComponent?.component_type ??
      componentTypeArray[0],
    calculation_value:
      calculationValue?.toFixed(2) ??
      priortizedComponent?.calculation_value ??
      existingComponent?.calculation_value,
  };
}

export function getEPFComponentFromField<
  T extends Omit<EmployeeProvidentFundDatabaseRow, "created_at" | "updated_at">,
>({
  field,
  value,
  existingComponent,
}: {
  field: T | undefined | null;
  value: number;
  existingComponent?: Omit<
    PaymentTemplateComponentDatabaseRow,
    "created_at" | "updated_at"
  >;
}) {
  if (!field) return null;

  const calculationValue =
    value * (field.employee_contribution ?? EMPLOYEE_EPF_PERCENTAGE);

  return {
    id: existingComponent?.id,
    template_id: existingComponent?.template_id,
    epf_id: field.id ?? existingComponent?.epf_id,
    target_type: "epf",
    component_type: "statutory_contribution",
    calculation_value:
      calculationValue?.toFixed(2) ?? existingComponent?.calculation_value,
  };
}

export function getESIComponentFromField<
  T extends EmployeeStateInsuranceDataType,
>({
  field,
  value,
  existingComponent,
}: {
  field: T | null | undefined;
  value: number;
  existingComponent?: Omit<
    PaymentTemplateComponentDatabaseRow,
    "created_at" | "updated_at"
  >;
}) {
  if (!field) return null;

  const calculationValue =
    value * (field.employees_contribution ?? ESI_EMPLOYEE_CONTRIBUTION);

  return {
    id: existingComponent?.id,
    template_id: existingComponent?.template_id,
    esi_id: field.id ?? existingComponent?.esi_id,
    target_type: "esi",
    component_type: "statutory_contribution",
    calculation_value:
      calculationValue?.toFixed(2) ?? existingComponent?.calculation_value,
  };
}

export function getPTComponentFromField<
  T extends Omit<
    ProfessionalTaxDatabaseRow,
    "gross_salary_range" | "created_at" | "updated_at"
  > & {
    gross_salary_range: any;
  },
>({
  field,
  value,
  existingComponent,
}: {
  field: T | null | undefined;
  value: number;
  existingComponent?: Omit<
    PaymentTemplateComponentDatabaseRow,
    "created_at" | "updated_at"
  >;
}) {
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
    id: existingComponent?.id,
    template_id: existingComponent?.template_id,
    pt_id: field.id ?? existingComponent?.pt_id,
    target_type: "pt",
    component_type: "statutory_contribution",
    calculation_value:
      calculationValue?.toFixed(2) || existingComponent?.calculation_value,
  };
}

export function getLWFComponentFromField<
  T extends Omit<LabourWelfareFundDatabaseRow, "created_at" | "updated_at">,
>({
  field,
  existingComponent,
}: {
  field: T | null | undefined;
  existingComponent?: Omit<
    PaymentTemplateComponentDatabaseRow,
    "created_at" | "updated_at"
  >;
}) {
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
    id: existingComponent?.id,
    template_id: existingComponent?.template_id,
    lwf_id: field.id ?? existingComponent?.lwf_id,
    target_type: "lwf",
    component_type: "statutory_contribution",
    calculation_value:
      calculationValue?.toFixed(2) || existingComponent?.calculation_value,
  };
}

export function getBonusComponentFromField<T extends StatutoryBonusDataType>({
  field,
  value,
  existingComponent,
}: {
  field: T | null | undefined;
  value: number;
  existingComponent?: Omit<
    PaymentTemplateComponentDatabaseRow,
    "created_at" | "updated_at"
  >;
}) {
  if (!field) return null;

  let calculationValue = null;

  if (field.percentage) {
    calculationValue = (field.percentage * value) / 100;
  }

  return {
    id: existingComponent?.id,
    template_id: existingComponent?.template_id,
    bonus_id: field.id ?? existingComponent?.bonus_id,
    target_type: "bonus",
    component_type: "earning",
    calculation_value:
      calculationValue?.toFixed(2) ?? existingComponent?.calculation_value,
  };
}

export function getValueforEPF({
  epf,
  values,
}: {
  epf: Omit<EmployeeProvidentFundDatabaseRow, "created_at" | "updated_at">;
  values: { [key: string]: number };
}) {
  let value = 0;

  for (const key in values) {
    value += values[key];
  }

  if (epf?.restrict_employee_contribution) {
    if (value >= (epf?.employee_restrict_value ?? EMPLOYEE_RESTRICTED_VALUE)) {
      return epf?.employee_restrict_value ?? EMPLOYEE_RESTRICTED_VALUE;
    }
  }

  return value;
}

export function getValueforESI({
  esi,
  values,
}: {
  esi: EmployeeStateInsuranceDataType;
  values: { [key: string]: number };
}) {
  let value = 0;

  for (const key in values) {
    value += values[key];
  }
  if (value > (esi?.max_limit ?? ESI_MAX_LIMIT)) {
    return 0;
  }

  return value;
}

export function getGrossValue({
  values,
}: {
  values: { [key: string]: number };
}) {
  let value = 0;

  for (const key in values) {
    value += values[key];
  }

  return value;
}
