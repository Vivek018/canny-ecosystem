import { convertToNull } from "@canny_ecosystem/utils";

import type {
  PaymentTemplateAssignmentsDatabaseInsert,
  PaymentTemplateAssignmentsDatabaseUpdate,
  TypedSupabaseClient,
} from "../types";

export async function createPaymentTemplateAssignment({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: PaymentTemplateAssignmentsDatabaseInsert;
  bypassAuth?: boolean;
}) {

  if (!bypassAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return { status: 400, error: "Unauthorized User" };
  }

  const { error, status } = await supabase
    .from("payment_template_assignments")
    .insert(data)
    .select()
    .single();

  if (error) console.error("createPaymentTemplateAssignment Error", error);

  return { status, error };
}

export async function updatePaymentTemplateAssignment({
  supabase,
  data,
  id,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: PaymentTemplateAssignmentsDatabaseUpdate;
  id: string;
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
    .from("payment_template_assignments")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) console.error("updatePaymentTemplateAssignment Error", error);

  return { status, error };
}

export async function deletePaymentTemplateAssignment({
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
    .from("payment_template_assignments")
    .delete()
    .eq("id", id);

  if (error) console.error("deletePaymentTemplateAssignment Error", error);

  return { status, error };
}
