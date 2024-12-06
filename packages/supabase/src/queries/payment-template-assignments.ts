import type {
  InferredType,
  PaymentTemplateAssignmentsDatabaseRow,
  TypedSupabaseClient,
} from "../types";

export async function getPaymentTemplateAssignmentIdByEmployeeId({
  supabase,
  employee_id,
}: { supabase: TypedSupabaseClient; employee_id: string }) {
  const columns = ["id"] as const;

  const { data, error } = await supabase
    .from("payment_template_assignments")
    .select(columns.join(","))
    .eq("employee_id", employee_id)
    .single<
      InferredType<
        PaymentTemplateAssignmentsDatabaseRow,
        (typeof columns)[number]
      >
    >();

  if (error) console.error(error);

  return { data, error };
}

export async function getPaymentTemplateAssignmentByEmployeeId({
  supabase,
  employee_id,
}: { supabase: TypedSupabaseClient; employee_id: string }) {
  const columns = [
    "id",
    "template_id",
    "assignment_type",
    "employee_id",
    "site_id",
    "eligibility_option",
    "position",
    "skill_level",
    "effective_from",
    "effective_to",
    "is_active",
    "name",
  ] as const;

  const { data, error } = await supabase
    .from("payment_template_assignments")
    .select(columns.join(","))
    .eq("employee_id", employee_id)
    .single<
      InferredType<
        PaymentTemplateAssignmentsDatabaseRow,
        (typeof columns)[number]
      >
    >();

  if (error) console.error(error);

  return { data, error };
}

export async function getPaymentTemplateAssignmentIdBySiteId({
  supabase,
  site_id,
}: { supabase: TypedSupabaseClient; site_id: string }) {
  const columns = ["id"] as const;

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

export async function getPaymentTemplateAssignmentBySiteId({
  supabase,
  site_id,
}: { supabase: TypedSupabaseClient; site_id: string }) {
  const columns = [
    "id",
    "template_id",
    "assignment_type",
    "employee_id",
    "site_id",
    "eligibility_option",
    "position",
    "skill_level",
    "effective_from",
    "effective_to",
    "is_active",
    "name",
  ] as const;

  const { data, error } = await supabase
    .from("payment_template_assignments")
    .select(columns.join(","))
    .eq("site_id", site_id);

  if (error) console.error(error);

  return { data, error };
}

export type PaymentTemplateAssignmentsType = Pick<
  PaymentTemplateAssignmentsDatabaseRow,
  | "id"
  | "template_id"
  | "assignment_type"
  | "employee_id"
  | "site_id"
  | "eligibility_option"
  | "position"
  | "skill_level"
  | "effective_from"
  | "effective_to"
  | "is_active"
  | "name"
>;
