import { convertToNull } from "@canny_ecosystem/utils";

import type {
  PaymentTemplateComponentsDatabaseInsert,
  PaymentTemplateComponentsDatabaseUpdate,
  TypedSupabaseClient,
} from "../types";

export async function createPaymentTemplateComponent({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: PaymentTemplateComponentsDatabaseInsert;
  bypassAuth?: boolean;
}) {
  if (!bypassAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return { status: 400, error: "Unauthorized User" };
  }

  const { error, status } = await supabase
    .from("payment_template_components")
    .insert(data)
    .select()
    .single();

  if (error) console.error(error);

  return { status, error };
}

export async function updatePaymentTemplateComponent({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: PaymentTemplateComponentsDatabaseUpdate;
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
    .from("payment_template_components")
    .update(updateData)
    .eq("id", data.id!)
    .select()
    .single();

  if (error) console.error("error", error);

  return { status, error };
}

export async function deletePaymentTemplateComponent({
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
    .from("payment_template_components")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) console.error(error);

  return { status, error };
}
