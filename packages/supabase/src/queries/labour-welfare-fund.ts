import { convertToNull } from "@canny_ecosystem/utils";
import type {
  InferredType,
  LabourWelfareFundDatabaseInsert,
  LabourWelfareFundDatabaseRow,
  LabourWelfareFundDatabaseUpdate,
  TypedSupabaseClient,
} from "../types";
import { HARD_QUERY_LIMIT } from "../constant";

export type LabourWelfareFundDataType = Pick<
  LabourWelfareFundDatabaseRow,
  | "id"
  | "deduction_cycle"
  | "employee_contribution"
  | "employer_contribution"
  | "company_id"
  | "state"
  | "status"
>;

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
    if (!user?.email) {
      return { status: 400, error: "Unauthorized User" };
    }
  }
  const {
    error,
    status,
    data: professionalTax,
  } = await supabase.from("labour_welfare_fund").insert(data).select().single();
  if (error) {
    console.error(error);
  }
  return { status, error, id: professionalTax?.id };
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
    if (!user?.email) {
      return { status: 400, error: "Unauthorized User" };
    }
  }
  const updateData = convertToNull(data);
  const { error, status } = await supabase
    .from("labour_welfare_fund")
    .update(updateData)
    .eq("id", data.id!)
    .select()
    .single();
  if (error) {
    console.error("error", error);
  }
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
    if (!user?.email) {
      return { status: 400, error: "Unauthorized User" };
    }
  }
  const { error, status } = await supabase
    .from("labour_welfare_fund")
    .delete()
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error(error);
  }
  return { status, error };
}

export async function getLabourWelfareFundsById({
  supabase,
  id,
  companyId,
}: { supabase: TypedSupabaseClient; id: string; companyId: string }) {
  const columns = [
    "id",
    "company_id",
    "state",
    "employee_contribution",
    "employer_contribution",
    "deduction_cycle",
    "status",
  ] as const;

  const { data, error } = await supabase
    .from("labour_welfare_fund")
    .select(columns.join(","))
    .eq("id", id)
    .eq("company_id", companyId)
    .single<InferredType<LabourWelfareFundDatabaseRow, (typeof columns)[number]>>();

  if (error) console.error(error);

  return { data, error };
}

export async function getLabourWelfareFundsByCompanyId({
  supabase,
  companyId,
}: { supabase: TypedSupabaseClient; companyId: string }) {
  const columns = [
    "id",
    "company_id",
    "state",
    "employee_contribution",
    "employer_contribution",
    "deduction_cycle",
    "status",
  ] as const;

  const { data, error } = await supabase
    .from("labour_welfare_fund")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .limit(HARD_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .returns<InferredType<LabourWelfareFundDatabaseRow, (typeof columns)[number]>[]>();

  if (error) console.error(error);

  return { data, error };
}