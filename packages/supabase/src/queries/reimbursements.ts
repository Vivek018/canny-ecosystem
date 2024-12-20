import { formatUTCDate } from "@canny_ecosystem/utils";
import type {
  InferredType,
  ReimbursementRow,
  TypedSupabaseClient,
} from "../types";

export async function getReimbursementsByCompanyId({
  supabase,
  companyId,
  from,
  to,
  filters,
  searchQuery,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
  from: number;
  to: number;
  filters?: ReimbursementFilters;
  searchQuery?: string;
}) {
  const columns = [
    "id",
    "company_id",
    "is_deductible",
    "status",
    "amount",
    "submitted_date",
  ] as const;

  const query = supabase
    .from("reimbursements")
    .select(
      `
        ${columns.join(",")},
            employee_name:employees!inner(first_name,middle_name,last_name),
          users!inner(id,email)`
    )
    .eq("company_id", companyId);

  if (searchQuery) {
    query.or(
      `first_name.ilike.*${searchQuery}*,middle_name.ilike.*${searchQuery}*,last_name.ilike.*${searchQuery}*`,
      {
        referencedTable: "employees",
      }
    );
  }

  if (filters) {
    const {
      submitted_date_start,
      submitted_date_end,
      status,
      is_deductible,
      user_email,
    } = filters;

    const dateFilters = [
      {
        field: "submitted_date",
        start: submitted_date_start,
        end: submitted_date_end,
      },
    ];
    for (const { field, start, end } of dateFilters) {
      if (start) query.gte(field, formatUTCDate(start));
      if (end) query.lte(field, formatUTCDate(end));
    }
    if (status) {
      query.eq("status", status.toLowerCase());
    }
    if (is_deductible) {
      query.eq("is_deductible", is_deductible.toLowerCase());
    }
    if (user_email) {
      query.eq("users.email", user_email);
    }
  }

  const { data, error } = await query.range(from, to);
  if (error) {
    console.error(error);
  }

  return { data, error };
}
export async function getReimbursementsById({
  supabase,
  reimbursementId,
}: {
  supabase: TypedSupabaseClient;
  reimbursementId: string;
}) {
  const columns = [
    "id",
    "employee_id",
    "company_id",
    "is_deductible",
    "status",
    "amount",
    "submitted_date",
    "user_id",
  ] as const;

  const { data, error } = await supabase
    .from("reimbursements")
    .select(columns.join(","))
    .eq("id", reimbursementId)
    .single<InferredType<ReimbursementRow, (typeof columns)[number]>>();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

export type ReimbursementFilters = {
  submitted_date_start?: string | undefined | null;
  submitted_date_end?: string | undefined | null;
  status?: string | undefined | null;
  is_deductible?: string | undefined | null;
  user_email?: string | undefined | null;
};

export async function getReimbursementsByEmployeeId({
  supabase,
  employeeId,
  from,
  to,
  filters,
}: {
  supabase: TypedSupabaseClient;
  employeeId: string;
  from: number;
  to: number;
  filters?: ReimbursementFilters;
  searchQuery?: string;
}) {
  const columns = [
    "id",

    "company_id",
    "is_deductible",
    "status",
    "amount",
    "submitted_date",
  ] as const;

  const query = supabase
    .from("reimbursements")
    .select(
      `
        ${columns.join(",")},
            employee_name:employees!inner(first_name, last_name),
          users!inner(id,email)`
    )
    .eq("employee_id", employeeId);

  if (filters) {
    const {
      submitted_date_start,
      submitted_date_end,
      status,
      is_deductible,
      user_email,
    } = filters;

    const dateFilters = [
      {
        field: "submitted_date",
        start: submitted_date_start,
        end: submitted_date_end,
      },
    ];
    for (const { field, start, end } of dateFilters) {
      if (start) query.gte(field, formatUTCDate(start));
      if (end) query.lte(field, formatUTCDate(end));
    }
    if (status) {
      query.eq("status", status.toLowerCase());
    }
    if (is_deductible) {
      query.eq("is_deductible", is_deductible.toLowerCase());
    }
    if (user_email) {
      query.eq("users.email", user_email);
    }
  }
  const { data, error } = await query.range(from, to);
  if (error) {
    console.error(error);
  }

  return { data, error };
}
