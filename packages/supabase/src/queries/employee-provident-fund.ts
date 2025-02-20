import { SINGLE_QUERY_LIMIT } from "../constant";
import type {
  EmployeeProvidentFundDatabaseRow,
  InferredType,
  TypedSupabaseClient,
} from "../types";

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
    .single<
      InferredType<EmployeeProvidentFundDatabaseRow, (typeof columns)[number]>
    >();

  if (error) {
    console.error("getEmployeeProvidentFundById Error", error);
  }

  return { data, error };
};

export const getEmployeeProvidentFundByEPFNumber = async ({
  supabase,
  epfNumber,
}: {
  supabase: TypedSupabaseClient;
  epfNumber: string;
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
    .eq("epf_number", epfNumber)
    .single<
      InferredType<EmployeeProvidentFundDatabaseRow, (typeof columns)[number]>
    >();

  if (error) console.error("getEmployeeProvidentFundByEPFNumber Error", error);

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
    "edli_restrict_value",
    "restrict_employee_contribution",
    "restrict_employer_contribution",
    "include_employer_contribution",
    "include_employer_edli_contribution",
    "include_admin_charges",
    "is_default",
  ] as const;

  const { data, error } = await supabase
    .from("employee_provident_fund")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .eq("is_default", true)
    .limit(SINGLE_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .maybeSingle<
      InferredType<EmployeeProvidentFundDatabaseRow, (typeof columns)[number]>
    >();

  if (error) {
    console.error("getEmployeeProvidentFundByCompanyId Error", error);
  }

  return { data, error };
};
