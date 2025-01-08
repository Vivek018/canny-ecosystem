import { convertToNull } from "@canny_ecosystem/utils";

import type {
  PaymentFieldDatabaseInsert,
  PaymentFieldDatabaseUpdate,
  TypedSupabaseClient,
} from "../types";

export async function createPaymentField({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: PaymentFieldDatabaseInsert;
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
    .from("payment_fields")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error(error);
  }

  return { status, error };
}

export async function updatePaymentField({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: PaymentFieldDatabaseUpdate;
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
    .from("payment_fields")
    .update(updateData)
    .eq("id", data.id!)
    .select()
    .single();

  if (error) {
    console.error("error", error);
  }

  return { status, error };
}

export async function deletePaymentField({
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
    .from("payment_fields")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
  }

  return { status, error };
}
