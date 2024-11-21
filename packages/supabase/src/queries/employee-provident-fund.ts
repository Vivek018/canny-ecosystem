import {
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
    "epf_number",
    "deduction_cycle",
    "employee_contribution",
    "employer_contribution",
    "employee_restrict_value",
    "restrict_employer_contribution",
    "include_employer_esi_contribution",
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
    console.error(error);
  }

  return { data, error };
};
