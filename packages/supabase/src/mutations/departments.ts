import { convertToNull } from "@canny_ecosystem/utils";
import type {
  DepartmentsDatabaseInsert,
  DepartmentsDatabaseUpdate,
  TypedSupabaseClient,
} from "../types";

export async function createDepartment({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: DepartmentsDatabaseInsert;
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
    .from("departments")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("createDepartment Error:", error);
  }

  return { status, error };
}

export async function updateDepartmentById({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: DepartmentsDatabaseUpdate;
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
    .from("departments")
    .update(updateData)
    .eq("id", data.id!);
  if (error) {
    console.error("updateDepartment Error:", error);
  }

  return { status, error };
}

export async function deleteDepartment({
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
    .from("departments")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteDepartment Error:", error);
  }

  return { status, error };
}
