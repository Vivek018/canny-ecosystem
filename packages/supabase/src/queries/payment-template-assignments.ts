import { HARD_QUERY_LIMIT } from "../constant";
import type {
  InferredType,
  PaymentTemplateAssignmentsDatabaseRow,
  TypedSupabaseClient,
} from "../types";

export async function getPaymentTemplateAssignmentIdByEmployeeId({
  supabase,
  employeeId,
}: { supabase: TypedSupabaseClient; employeeId: string }) {
  const columns = ["id"] as const;

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

export async function getTemplateIdByEmployeeId({
  supabase,
  employeeId,
}: { supabase: TypedSupabaseClient; employeeId: string }) {
  const columns = ["template_id"] as const;

  const { data, error } = await supabase
    .from("payment_template_assignments")
    .select(columns.join(","))
    .order("created_at", { ascending: false })
    .eq("employee_id", employeeId)
    .maybeSingle<
      InferredType<
        Pick<PaymentTemplateAssignmentsDatabaseRow, "template_id">,
        (typeof columns)[number]
      >
    >();

  if (error) console.error(error);

  return { data, error };
}

export async function getPaymentTemplateAssignmentByEmployeeId({
  supabase,
  employeeId,
}: { supabase: TypedSupabaseClient; employeeId: string }) {
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

export async function getPaymentTemplateAssignmentsBySiteId({
  supabase,
  siteId,
}: { supabase: TypedSupabaseClient; siteId: string }) {
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
    .eq("site_id", siteId)
    .limit(HARD_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .returns<PaymentTemplateAssignmentsType[]>();

  if (error) console.error(error);

  return { data, error };
}
