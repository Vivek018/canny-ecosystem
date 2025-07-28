import { convertToNull } from "@canny_ecosystem/utils";
import type {
  EmployeeProvidentFundDatabaseInsert,
  EmployeeProvidentFundDatabaseUpdate,
  TypedSupabaseClient,
} from "../types";

export const createEmployeeProvidentFund = async ({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeProvidentFundDatabaseInsert;
  bypassAuth?: boolean;
}) => {
  if (!bypassAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      throw new Error("User is not logged in");
    }
  }

  const { error, status } = await supabase
    .from("employee_provident_fund")
    .insert(data);

  if (error) {
    console.error("createEmployeeProvidentFund Error", error);
  }

  return {
    status,
    error,
  };
};

export const updateEmployeeProvidentFund = async ({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeProvidentFundDatabaseUpdate;
  bypassAuth?: boolean;
}) => {
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
    .from("employee_provident_fund")
    .update(updateData)
    .eq("id", data.id!);

  if (error) {
    console.error("updateEmployeeProvidentFund Error", error);
  }

  return {
    status,
    error,
  };
};

export const deleteEmployeeProvidentFund = async ({
  supabase,
  id,
  bypassAuth = true,
}: {
  supabase: TypedSupabaseClient;
  id: string;
  bypassAuth?: boolean;
}) => {
  if (!bypassAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return { status: 400, error: "Unauthorized User" };
    }
  }

  const { error, status } = await supabase
    .from("employee_provident_fund")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteEmployeeProvidentFund Error", error);
  }

  return {
    status,
    error,
  };
};
