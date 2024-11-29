import type {
  InferredType,
  PaymentTemplateAssignmentsDatabaseRow,
  TypedSupabaseClient,
} from "../types";
import { HARD_QUERY_LIMIT } from "../constant";
import { SINGLE_QUERY_LIMIT } from "../constant";

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

// export async function getPaymentTemplateAssignmentById({
//   supabase,
//   id,
// }: { supabase: TypedSupabaseClient; id: string;}) {
//   const columns = [
//     "id",
//     "company_id",
//     "state",
//     "employee_contribution",
//     "employer_contribution",
//     "deduction_cycle",
//     "status",
//   ] as const;

//   const { data, error } = await supabase
//     .from("labour_welfare_fund")
//     .select(columns.join(","))
//     .eq("id", id)
//     .single<InferredType<PaymentTemplateAssignmentsDatabaseRow, (typeof columns)[number]>>();

//   if (error) console.error(error);

//   return { data, error };
// }

// export async function getLabourWelfareFundsByCompanyId({
//   supabase,
//   companyId,
// }: { supabase: TypedSupabaseClient; companyId: string }) {
//   const columns = [
//     "id",
//     "company_id",
//     "state",
//     "employee_contribution",
//     "employer_contribution",
//     "deduction_cycle",
//     "status",
//   ] as const;

//   const { data, error } = await supabase
//     .from("labour_welfare_fund")
//     .select(columns.join(","))
//     .eq("company_id", companyId)
//     .limit(HARD_QUERY_LIMIT)
//     .order("created_at", { ascending: false })
//     .returns<InferredType<LabourWelfareFundDatabaseRow, (typeof columns)[number]>[]>();

//   if (error) console.error(error);

//   return { data, error };
// }
