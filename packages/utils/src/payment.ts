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
  roundToNearest,
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
    | Omit<PaymentTemplateComponentDatabaseRow, "created_at">
    | null
    | undefined;
  existingComponent?: Omit<PaymentTemplateComponentDatabaseRow, "created_at">;
}) {
  if (!field) return null;

  let calculationValue: number | null = null;

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
      calculationValue?.toFixed(3) ??
      priortizedComponent?.calculation_value ??
      existingComponent?.calculation_value,
  };
}

export function getEPFComponentFromField<
  T extends Omit<EmployeeProvidentFundDatabaseRow, "created_at">,
>({
  field,
  value,
  existingComponent,
}: {
  field: T | undefined | null;
  value: number;
  existingComponent?: Omit<PaymentTemplateComponentDatabaseRow, "created_at">;
}) {
  if (!field) return null;

  const calculationValue =
    value * (field.employee_contribution ?? EMPLOYEE_EPF_PERCENTAGE);

  return {
    id: existingComponent?.id,
    template_id: existingComponent?.template_id,
    epf_id: field.id ?? existingComponent?.epf_id,
    target_type: "epf",
    component_type: "deduction",
    calculation_value:
      calculationValue?.toFixed(3) ?? existingComponent?.calculation_value,
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
  existingComponent?: Omit<PaymentTemplateComponentDatabaseRow, "created_at">;
}) {
  if (!field) return null;

  const calculationValue =
    value * (field.employee_contribution ?? ESI_EMPLOYEE_CONTRIBUTION);

  return {
    id: existingComponent?.id,
    template_id: existingComponent?.template_id,
    esi_id: field.id ?? existingComponent?.esi_id,
    target_type: "esi",
    component_type: "deduction",
    calculation_value:
      calculationValue?.toFixed(3) ?? existingComponent?.calculation_value,
  };
}

export function getPTComponentFromField<
  T extends Omit<
    ProfessionalTaxDatabaseRow,
    "gross_salary_range" | "created_at"
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
  existingComponent?: Omit<PaymentTemplateComponentDatabaseRow, "created_at">;
}) {
  if (!field) return null;

  if (!field.gross_salary_range?.length) return null;

  let calculationValue = 0;

  const grossSalaryRange =
    typeof field.gross_salary_range === "string"
      ? JSON.parse(field.gross_salary_range)
      : field.gross_salary_range;

  for (const range of grossSalaryRange) {
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
    component_type: "deduction",
    calculation_value:
      calculationValue?.toFixed(3) || existingComponent?.calculation_value,
  };
}

export function getLWFComponentFromField<
  T extends Omit<LabourWelfareFundDatabaseRow, "created_at">,
>({
  field,
  existingComponent,
}: {
  field: T | null | undefined;
  existingComponent?: Omit<PaymentTemplateComponentDatabaseRow, "created_at">;
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
    component_type: "deduction",
    calculation_value:
      calculationValue?.toFixed(3) || existingComponent?.calculation_value,
  };
}

export function getBonusComponentFromField<T extends StatutoryBonusDataType>({
  field,
  value,
  existingComponent,
}: {
  field: T | null | undefined;
  value: number;
  existingComponent?: Omit<PaymentTemplateComponentDatabaseRow, "created_at">;
}) {
  if (!field) return null;

  let calculationValue: number | null = null;

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
      calculationValue?.toFixed(3) ?? existingComponent?.calculation_value,
  };
}

export function getValueforEPF({
  epf,
  values,
}: {
  epf: Omit<EmployeeProvidentFundDatabaseRow, "created_at">;
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

  return Number.parseFloat(value.toFixed(3));
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

  return Number.parseFloat(value.toFixed(3));
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

  return Number.parseFloat(value.toFixed(3));
}

export function calculateProRataAmount({
  baseAmount,
  presentDays,
  totalWorkingDays,
  overtimeHours,
  overtimeRate,
}: {
  baseAmount: number;
  presentDays: number;
  totalWorkingDays: number;
  overtimeHours: number;
  overtimeRate: number;
}): number {
  const proRataAmount = (baseAmount / totalWorkingDays) * presentDays;
  const overtimeAmount = overtimeHours * overtimeRate;
  return Number.parseFloat((proRataAmount + overtimeAmount).toFixed(3));
}

export function calculateSalaryTotalNetAmount(
  salaryDataArray: Record<string, any>[],
): number {
  let allEarnings = 0;
  let allDeductions = 0;
  for (const employeeData of salaryDataArray) {
    for (const value of Object.values(employeeData)) {
      if (
        value &&
        typeof value === "object" &&
        "amount" in value &&
        "type" in value
      ) {
        const amount = Number(value.amount) || 0;
        if (value.type === "earning") {
          allEarnings += amount;
        } else if (value.type === "deduction") {
          allDeductions += amount;
        }
      }
    }
  }

  return roundToNearest(allEarnings) - roundToNearest(allDeductions);
}

export const calculateNetAmountAfterEntryCreated = (employee: any): number => {
  let gross = 0;
  let deductions = 0;

  for (const entry of employee.salary_entries.salary_field_values) {
    const amount = entry.amount ?? 0;
    const type = entry.payroll_fields?.type;

    if (type === "earning") gross += amount;
    else if (type === "deduction") deductions += amount;
  }

  return gross - deductions;
};

export const calculateFieldTotalsWithNetPay = (
  employees: any[],
): Record<string, { amount: number; type: string } | number> => {
  const fieldTotals: Record<string, { amount: number; type: string }> = {};
  let gross = 0;
  let deductions = 0;

  for (const employee of employees) {
    const fieldValues = employee.salary_entries?.salary_field_values ?? [];

    for (const entry of fieldValues) {
      const amount = entry.amount ?? 0;
      const fieldName = entry.payroll_fields.name;
      const fieldType = entry.payroll_fields.type;

      if (!fieldTotals[fieldName]) {
        fieldTotals[fieldName] = { amount: 0, type: fieldType };
      }
      fieldTotals[fieldName].amount += amount;

      if (fieldType === "earning") {
        gross += amount;
      } else if (fieldType === "deduction") {
        deductions += amount;
      }
    }
  }

  return {
    ...fieldTotals,
    GROSS: gross,
    DEDUCTION: deductions,
    TOTAL: gross - deductions,
  };
};

export const getUniqueFields = (data: any[]): string[] => {
  const preferredEarningOrder = ["BASIC", "HRA", "DA"];
  const preferredDeductionOrder = ["PF", "ESIC", "PT"];

  const earningFields = new Map<string, true>();
  const deductionFields = new Map<string, true>();

  for (const emp of data) {
    const fieldValues = emp.salary_entries?.salary_field_values ?? [];

    for (const entry of fieldValues) {
      const name = entry.payroll_fields?.name;
      const type = entry.payroll_fields?.type ?? "earning";

      if (!name) continue;

      if (type === "deduction") {
        if (!deductionFields.has(name)) deductionFields.set(name, true);
      } else {
        if (!earningFields.has(name)) earningFields.set(name, true);
      }
    }
  }

  const orderedEarnings = preferredEarningOrder.filter((f) =>
    earningFields.has(f),
  );
  const remainingEarnings = [...earningFields.keys()].filter(
    (f) => !preferredEarningOrder.includes(f),
  );

  const orderedDeductions = preferredDeductionOrder.filter((f) =>
    deductionFields.has(f),
  );
  const remainingDeductions = [...deductionFields.keys()].filter(
    (f) => !preferredDeductionOrder.includes(f),
  );

  return [
    ...orderedEarnings,
    ...remainingEarnings,
    ...orderedDeductions,
    ...remainingDeductions,
  ];
};
