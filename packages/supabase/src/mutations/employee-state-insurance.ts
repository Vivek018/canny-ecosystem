import { convertToNull } from "@canny_ecosystem/utils";
import type {
  EmployeeStateInsuranceDatabaseUpdate,
  EmployeeStateInsuranceDatabaseInsert,
  TypedSupabaseClient,
} from "../types";

export async function createEmployeeStateInsurance({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeStateInsuranceDatabaseInsert;
  bypassAuth?: boolean;
}) {
  if (!bypassAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return { status: 400, error: "Unauthorized User" };
    }
  }

  const {
    error,
    status,
    data: employeeProvidentFundData,
  } = await supabase
    .from("employee_state_insurance")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("createEmployeeStateInsurance Error", error);
  }

  return {
    employeeProvidentFundData,
    status,
    error,
  };
}

export async function updateEmployeeStateInsurance({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeStateInsuranceDatabaseUpdate;
  bypassAuth?: boolean;
}) {
  if (!bypassAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return { status: 400, error: "Unauthorized User" };
    }
  }

  const updateData = convertToNull(data);

  const { error, status } = await supabase
    .from("employee_state_insurance")
    .update(updateData)
    .eq("id", data.id!)
    .select()
    .single();

  if (error) {
    console.error("updateEmployeeStateInsurance Error", error);
  }

  return {
    status,
    error,
  };
}

export async function deleteEmployeeStateInsurance({
  supabase,
  id,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  id: string;
  bypassAuth?: boolean;
}) {
  if (!bypassAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return { status: 400, error: "Unauthorized User" };
    }
  }

  const { error, status } = await supabase
    .from("employee_state_insurance")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("deleteEmployeeStateInsurance Error", error);
  }

  return { status, error };
}
