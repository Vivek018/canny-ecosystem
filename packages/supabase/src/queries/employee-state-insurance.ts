import { HARD_QUERY_LIMIT } from "../constant";
import {
  EmployeeStateInsuranceDatabaseRow,
  InferredType,
  TypedSupabaseClient,
} from "../types";

export type EmployeeStateInsuranceDataType = Pick<
  EmployeeStateInsuranceDatabaseRow,
  | "id"
  | "company_id"
  | "esi_number"
  | "deduction_cycle"
  | "employees_contribution"
  | "employers_contribution"
  | "include_employer_contribution"
>;

export const getEmployeeStateInsuranceById = async ({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) => {
  const columns = [
    "id",
    "company_id",
    "esi_number",
    "deduction_cycle",
    "employees_contribution",
    "employers_contribution",
    "include_employer_contribution",
  ] as const;

  const { data, error } = await supabase
    .from("employee_state_insurance")
    .select(columns.join(","))
    .eq("id", id)
    .single<
      InferredType<EmployeeStateInsuranceDatabaseRow, (typeof columns)[number]>
    >();

  if (error) {
    console.error(error);
  }

  return { data, error };
};

export const getEmployeeStateInsuranceByCompanyId = async ({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) => {
  const columns = [
    "id",
    "company_id",
    "esi_number",
    "deduction_cycle",
    "employees_contribution",
    "employers_contribution",
    "include_employer_contribution",
  ] as const;

  const { data, error } = await supabase
    .from("employee_state_insurance")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .limit(HARD_QUERY_LIMIT)
    .returns<EmployeeStateInsuranceDataType[]>();

  if (error) {
    console.error(error);
  }

  return { data, error };
};
