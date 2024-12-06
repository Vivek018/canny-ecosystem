import { SINGLE_QUERY_LIMIT } from "../constant";
import type {
  EmployeeProvidentFundDatabaseRow,
  InferredType,
  TypedSupabaseClient,
} from "../types";

export type EmployeeProvidentFundDataType = Pick<
  EmployeeProvidentFundDatabaseRow,
  | "id"
  | "company_id"
  | "epf_number"
  | "deduction_cycle"
  | "employee_contribution"
  | "employer_contribution"
  | "employee_restrict_value"
  | "restrict_employer_contribution"
  | "company_id"
  | "include_admin_charges"
  | "include_employer_edli_contribution"
>;

export const getEmployeeProvidentFundById = async ({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) => {
  const columns = [
    "id",
    "company_id",
    "epf_number",
    "deduction_cycle",
    "employee_contribution",
    "employer_contribution",
    "employee_restrict_value",
    "employer_restrict_value",
    "restrict_employee_contribution",
    "restrict_employer_contribution",
    "include_employer_contribution",
    "include_employer_edli_contribution",
    "include_admin_charges",
  ] as const;

  const { data, error } = await supabase
    .from("employee_provident_fund")
    .select(columns.join(","))
    .eq("id", id)
    .limit(SINGLE_QUERY_LIMIT)
    .single<
      InferredType<EmployeeProvidentFundDatabaseRow, (typeof columns)[number]>
    >();

  if (error) {
    console.error(error);
  }

  return { data, error };
};

export const getEmployeeProvidentFundByCompanyId = async ({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) => {
  const columns = [
    "id",
    "company_id",
    "epf_number",
    "deduction_cycle",
    "employee_contribution",
    "employer_contribution",
    "employee_restrict_value",
    "employer_restrict_value",
    "restrict_employee_contribution",
    "restrict_employer_contribution",
    "include_employer_contribution",
    "include_employer_edli_contribution",
    "include_admin_charges",
  ] as const;

  const { data, error } = await supabase
    .from("employee_provident_fund")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .limit(SINGLE_QUERY_LIMIT)
    .maybeSingle<
      InferredType<EmployeeProvidentFundDatabaseRow, (typeof columns)[number]>
    >();

  if (error) {
    console.error(error);
  }

  return { data, error };
};
