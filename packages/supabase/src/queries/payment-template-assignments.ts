import { HARD_QUERY_LIMIT, SINGLE_QUERY_LIMIT } from "../constant";
import type {
  InferredType,
  PaymentTemplateAssignmentsDatabaseRow,
  TypedSupabaseClient,
} from "../types";
import { getEmployeeProjectAssignmentByEmployeeId } from "./employees";
import { getDefaultTemplateIdByCompanyId } from "./payment-templates";

export async function getLinkedPaymentTemplateIdByEmployeeId({
  supabase,
  employeeId,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  employeeId: string;
  companyId: string;
}) {
  try {
    const { data: templateData, error: templateError } =
      await getTemplateIdByEmployeeId({ supabase, employeeId });

    if (templateError) {
      console.error(
        "getLinkedPaymentTemplateIdByEmployeeId Error (templateData)",
        templateError,
      );
      return { data: null, error: templateError };
    }

    if (templateData?.template_id) {
      return { data: { template_id: templateData.template_id }, error: null };
    }

    const { data: employeeProjectAssignment, error: employeeProjectError } =
      await getEmployeeProjectAssignmentByEmployeeId({ supabase, employeeId });

    if (employeeProjectError) {
      console.error(
        "getLinkedPaymentTemplateIdByEmployeeId Error (employeeProjectAssignment)",
        employeeProjectError,
      );
      return { data: null, error: employeeProjectError };
    }

    const { data: sitePaymentTemplateAssignment, error: sitePaymentError } =
      await getPaymentTemplateAssignmentBySiteAndPositionOrSkillType({
        supabase,
        site_id: employeeProjectAssignment?.site_id!,
        position: employeeProjectAssignment?.position!,
        skill_level: employeeProjectAssignment?.skill_level!,
      });

    if (sitePaymentError) {
      console.error(
        "getLinkedPaymentTemplateIdByEmployeeId Error (sitePaymentTemplateAssignment)",
        sitePaymentError,
      );
      return { data: null, error: sitePaymentError };
    }

    if (sitePaymentTemplateAssignment?.template_id) {
      return {
        data: { template_id: sitePaymentTemplateAssignment.template_id },
        error: null,
      };
    }

    const { data: defaultTemplateData, error: defaultTemplateError } =
      await getDefaultTemplateIdByCompanyId({ supabase, companyId });

    if (defaultTemplateError) {
      console.error(
        "getLinkedPaymentTemplateIdByEmployeeId Error (defaultTemplateData)",
        defaultTemplateError,
      );
      return { data: null, error: defaultTemplateError };
    }

    return { data: { template_id: defaultTemplateData?.id }, error: null };
  } catch (error) {
    console.error(
      "getLinkedPaymentTemplateIdByEmployeeId Unexpected Error",
      error,
    );
    return { data: null, error };
  }
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

  if (error) console.error("getTemplateIdByEmployeeId Error", error);

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
    .order("created_at", { ascending: false })
    .eq("employee_id", employeeId)
    .maybeSingle<
      InferredType<
        PaymentTemplateAssignmentsDatabaseRow,
        (typeof columns)[number]
      >
    >();

  if (error)
    console.error("getPaymentTemplateAssignmentByEmployeeId Error", error);

  return { data, error };
}

export async function getPaymentTemplateAssignmentById({
  supabase,
  id,
}: { supabase: TypedSupabaseClient; id: string }) {
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
    .eq("id", id)
    .single<
      InferredType<
        PaymentTemplateAssignmentsDatabaseRow,
        (typeof columns)[number]
      >
    >();

  if (error) console.error("getPaymentTemplateAssignmentById Error", error);

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
    .eq("site_id", site_id)
    .order("created_at", { ascending: false })
    .limit(SINGLE_QUERY_LIMIT)
    .single<
      InferredType<
        PaymentTemplateAssignmentsDatabaseRow,
        (typeof columns)[number]
      >
    >();

  if (error) console.error("getPaymentTemplateAssignmentBySiteId Error", error);

  return { data, error };
}

export async function getPaymentTemplateAssignmentBySiteAndPositionOrSkillType({
  supabase,
  site_id,
  position,
  skill_level,
}: {
  supabase: TypedSupabaseClient;
  site_id: string;
  position?: string;
  skill_level?: string;
}) {
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

  let query = supabase
    .from("payment_template_assignments")
    .select(columns.join(","))
    .eq("site_id", site_id)
    .order("created_at", { ascending: false })
    .limit(SINGLE_QUERY_LIMIT);

  if (position) {
    query = query.eq("position", position);
  } else if (skill_level) {
    query = query.eq("skill_level", skill_level);
  }

  const { data, error } =
    await query.maybeSingle<
      InferredType<
        PaymentTemplateAssignmentsDatabaseRow,
        (typeof columns)[number]
      >
    >();

  if (error) {
    console.error(
      "getPaymentTemplateAssignmentBySiteAndPositionOrSkillType Error",
      error,
    );
  }

  return { data, error };
}

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

  if (error)
    console.error("getPaymentTemplateAssignmentsBySiteId Error", error);

  return { data, error };
}
