import { convertToNull } from "@canny_ecosystem/utils";

import type {
  LabourWelfareFundDatabaseInsert,
  LabourWelfareFundDatabaseUpdate,
  TypedSupabaseClient,
} from "../types";

export async function createLabourWelfareFund({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: LabourWelfareFundDatabaseInsert;
  bypassAuth?: boolean;
}) {
  if (!bypassAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return { status: 400, error: "Unauthorized User" };
  }

  const { error, status } = await supabase
    .from("labour_welfare_fund")
    .insert(data);

  if (error) console.error("createLabourWelfareFund Error", error);

  return { status, error };
}

export async function updateLabourWelfareFund({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: LabourWelfareFundDatabaseUpdate;
  bypassAuth?: boolean;
}) {
  if (!bypassAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) return { status: 400, error: "Unauthorized User" };
  }

  const updateData = convertToNull(data);

  const { error, status } = await supabase
    .from("labour_welfare_fund")
    .update(updateData)
    .eq("id", data.id!);

  if (error) console.error("updateLabourWelfareFund Error", error);

  return { status, error };
}

export async function deleteLabourWelfareFund({
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

    if (!user?.email) return { status: 400, error: "Unauthorized User" };
  }

  const { error, status } = await supabase
    .from("labour_welfare_fund")
    .delete()
    .eq("id", id);

  if (error) console.error("deleteLabourWelfareFund Error", error);

  return { status, error };
}
