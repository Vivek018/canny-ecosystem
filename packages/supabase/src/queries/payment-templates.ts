import type {
  InferredType,
  PaymentFieldDatabaseRow,
  PaymentTemplateAssignmentsDatabaseRow,
  PaymentTemplateComponentDatabaseRow,
  PaymentTemplateDatabaseRow,
  TypedSupabaseClient,
} from "../types";
import { HARD_QUERY_LIMIT } from "../constant";

export async function getPaymentTemplatesByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const columns = [
    "id",
    "name",
    "description",
    "monthly_ctc",
    "state",
    "is_active",
    "is_default",
    "company_id",
  ] as const;

  const { data, error } = await supabase
    .from("payment_templates")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .limit(HARD_QUERY_LIMIT)
    .order("created_at", { ascending: true })
    .returns<
      InferredType<PaymentTemplateDatabaseRow, (typeof columns)[number]>[]
    >();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

export async function getPaymentTemplateById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "id",
    "name",
    "description",
    "monthly_ctc",
    "state",
    "is_active",
    "is_default",
    "company_id",
  ] as const;

  const { data, error } = await supabase
    .from("payment_templates")
    .select(columns.join(","))
    .eq("id", id)
    .single<
      InferredType<PaymentTemplateDatabaseRow, (typeof columns)[number]>
    >();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

export async function getPaymentTemplateComponentsByTemplateId({
  supabase,
  templateId,
}: {
  supabase: TypedSupabaseClient;
  templateId: string;
}) {
  const columns = [
    "id",
    "template_id",
    "payment_field_id",
    "epf_id",
    "esi_id",
    "pt_id",
    "lwf_id",
    "bonus_id",
    "target_type",
    "component_type",
    "calculation_value",
    "display_order",
  ] as const;

  const { data, error } = await supabase
    .from("payment_template_components")
    .select(`${columns.join(",")}, payment_fields(id, name))`)
    .eq("template_id", templateId)
    .order("created_at", { ascending: true })
    .limit(HARD_QUERY_LIMIT)
    .returns<PaymentTemplateComponentType[]>();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

export async function getPaymentTemplateComponentById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "id",
    "template_id",
    "target_type",
    "payment_field_id",
    "epf_id",
    "esi_id",
    "pt_id",
    "lwf_id",
    "bonus_id",
    "component_type",
    "calculation_value",
    "display_order",
  ] as const;

  const { data, error } = await supabase
    .from("payment_template_components")
    .select(`${columns.join(",")}`)
    .eq("id", id)
    .single<
      InferredType<PaymentTemplateComponentType, (typeof columns)[number]>
    >();

  if (error) console.error(error);

  return { data, error };
}

export async function getPaymentTemplateWithComponentsById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const { data, error } = await getPaymentTemplateById({ supabase, id });

  let returnData: PaymentTemplateWithComponentsType | null = null;
  let componentsError = null;
  if (data) {
    returnData = {
      id: data.id,
      monthly_ctc: data.monthly_ctc,
      state: data.state,
    };

    const { data: componentsData, error } =
      await getPaymentTemplateComponentsByTemplateId({
        supabase,
        templateId: data.id,
      });

    componentsError = error;

    if (componentsData) {
      returnData.payment_template_components = componentsData;
    }
  }

  return { data: returnData, error, componentsError };
}

export async function getPaymentTemplateByEmployeeId({
  supabase,
  employeeId,
}: { supabase: TypedSupabaseClient; employeeId: string }) {
  const columns = ["template_id"] as const;

  const { data, error } = await supabase
    .from("payment_template_assignments")
    .select(columns.join(","))
    .eq("employee_id", employeeId)
    .single<
      InferredType<
        PaymentTemplateAssignmentsDatabaseRow,
        (typeof columns)[number]
      >
    >();

  if (error) console.error(error);

  return { data, error };
}

export async function getPaymentTemplateBySiteId({
  supabase,
  site_id,
}: { supabase: TypedSupabaseClient; site_id: string }) {
  const columns = ["template_id"] as const;

  const { data, error } = await supabase
    .from("payment_template_assignments")
    .select(columns.join(","))
    .eq("site_id", site_id)
    .single<
      InferredType<
        PaymentTemplateAssignmentsDatabaseRow,
        (typeof columns)[number]
      >
    >();

  if (error) console.error(error);

  return { data, error };
}

export async function getDefaultTemplateIdByCompanyId({
  supabase,
  companyId,
}: { supabase: TypedSupabaseClient; companyId: string }) {
  const columns = ["id"] as const;

  const { data, error } = await supabase
    .from("payment_templates")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .eq("is_default", true)
    .single<
      InferredType<PaymentTemplateDatabaseRow, (typeof columns)[number]>
    >();

  if (error) console.error(error);

  return { data, error };
}

export type PaymentTemplateComponentType = Omit<
  PaymentTemplateComponentDatabaseRow,
  "created_at" | "updated_at"
> & {
  payment_fields: {
    id: Pick<PaymentFieldDatabaseRow, "id">;
    name: Pick<PaymentFieldDatabaseRow, "name">;
  };
};

export type PaymentTemplateWithComponentsType = Pick<
  PaymentTemplateDatabaseRow,
  "monthly_ctc" | "state" | "id"
> & {
  payment_template_components?: Omit<
    PaymentTemplateComponentDatabaseRow,
    "created_at" | "updated_at"
  >[];
};
