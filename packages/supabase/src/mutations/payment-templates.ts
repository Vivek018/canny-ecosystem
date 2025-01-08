import type {
  PaymentTemplateComponentDatabaseInsert,
  PaymentTemplateComponentDatabaseUpdate,
  PaymentTemplateDatabaseInsert,
  TypedSupabaseClient,
} from "../types";

export async function createPaymentTemplate({
  supabase,
  templateData,
  templateComponentsData,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  templateData: PaymentTemplateDatabaseInsert;
  templateComponentsData?: Omit<
    PaymentTemplateComponentDatabaseInsert,
    "template_id"
  >[];
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

  const { error, status, data } = await supabase
    .from("payment_templates")
    .insert(templateData)
    .select("id")
    .single();

  if (error) {
    console.error("payment_template ", error);
    return {
      status,
      templateError: error,
      templateComponentsError: null,
      id: null,
    };
  }

  if (data?.id && templateComponentsData?.length) {
    const finalTemplateComponentsData = templateComponentsData.map(
      ({ id, ...component }) => ({
        ...component,
        template_id: data.id,
      }),
    );

    const { error: templateComponentsError } =
      await createMultiPaymentTemplateComponents({
        supabase,
        dataArray: finalTemplateComponentsData,
        bypassAuth,
      });

    return {
      status,
      templateError: null,
      templateComponentsError,
      id: data?.id,
    };
  }

  return {
    status,
    templateError: null,
    templateComponentsError: null,
    id: data?.id,
  };
}

export async function createMultiPaymentTemplateComponents({
  supabase,
  dataArray,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  dataArray: PaymentTemplateComponentDatabaseInsert[];
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
    .from("payment_template_components")
    .insert(dataArray);

  if (error) {
    console.error("payment_template_components ", error);
  }

  return {
    status,
    error,
  };
}

import { convertToNull } from "@canny_ecosystem/utils";

export async function createPaymentTemplateComponent({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: PaymentTemplateComponentDatabaseInsert;
  bypassAuth?: boolean;
}) {
  if (!bypassAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email)
      return {
        status: 400,
        error: "Unauthorized User",
      };
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
  data: PaymentTemplateComponentDatabaseUpdate;
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
    .eq("id", id);

  if (error) console.error(error);

  return { status, error };
}
