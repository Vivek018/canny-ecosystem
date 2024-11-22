import {
    EmployeeStateInsuranceDatabaseRow,
    InferredType,
    TypedSupabaseClient,
  } from "../types";
  
  export const getEmployeeStateInsuranceById = async ({
    supabase,
    id,
  }: {
    supabase: TypedSupabaseClient;
    id: string;
  }) => {
    const columns = [
      "id",
      "esi_number",
      "deduction_cycle",
      "employees_contribution",
      "employers_contribution",
      "include_employer_contribution"
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
  