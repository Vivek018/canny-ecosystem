import { convertToNull } from "@canny_ecosystem/utils";
import type {
  EmployeeLetterDatabaseInsert,
  EmployeeLetterDatabaseUpdate,
  TypedSupabaseClient,
} from "../types";

export async function createEmployeeLetter({
  supabase,
  letterData,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  letterData: EmployeeLetterDatabaseInsert;
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
  const { status, error } = await supabase
    .from("employee_letter")
    .insert(letterData)
    .select("id")
    .single();

  if (error) {
    console.error("createEmployeeLetter Error", error);
  }

  return { status, error };
}

export async function updateEmployeeLetter({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeLetterDatabaseUpdate;
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
    .from("employee_letter")
    .update(updateData)
    .eq("id", data.id!);

  if (error) {
    console.error("updateEmployeeLetter Error", error);
  }

  return { status, error };
}

export async function deleteEmployeeLetter({
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
    .from("employee_letter")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteEmployeeLetter Error", error);
  }

  return { status, error };
}
