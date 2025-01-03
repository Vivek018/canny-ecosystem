import { formatUTCDate } from "@canny_ecosystem/utils";
import type {
  EmployeeDatabaseRow,
  InferredType,
  ReimbursementRow,
  TypedSupabaseClient,
  UserDatabaseRow,
} from "../types";

export type ReimbursementDataType = Pick<
  ReimbursementRow,
  | "id"
  | "employee_id"
  | "company_id"
  | "is_deductible"
  | "status"
  | "amount"
  | "submitted_date"
  | "user_id"
> & {
  employee_name: Pick<
    EmployeeDatabaseRow,
    "id" | "first_name" | "middle_name" | "last_name"
  >;
} & {
  users: Pick<UserDatabaseRow, "id" | "email">;
};

export async function getReimbursementsByCompanyId({
  supabase,
  companyId,
  params,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
  params: {
    from: number;
    to: number;
    sort?: [string, "asc" | "desc"];
    searchQuery?: string;
    filters?: ReimbursementFilters;
  };
}) {
  const { from, to, sort, searchQuery, filters } = params;
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
          users!inner(id,email)`,
      { count: "exact" },
    )
    .eq("company_id", companyId);

  if (sort) {
    const [column, direction] = sort;
    query.order(column, { ascending: direction === "asc" });
  } else {
    query.order("created_at", { ascending: false });
  }
  if (searchQuery) {
    const searchQueryArray = searchQuery.split(" ");
    if (searchQueryArray?.length > 0 && searchQueryArray?.length <= 3) {
      for (const searchQueryElement of searchQueryArray) {
        query.or(
          `first_name.ilike.*${searchQueryElement}*,middle_name.ilike.*${searchQueryElement}*,last_name.ilike.*${searchQueryElement}*`,
          {
            referencedTable: "employees",
          },
        );
      }
    } else {
      query.or(
        `first_name.ilike.*${searchQuery}*,middle_name.ilike.*${searchQuery}*,last_name.ilike.*${searchQuery}*`,
        {
          referencedTable: "employees",
        },
      );
    }
  }

  if (filters) {
    const {
      submitted_date_start,
      submitted_date_end,
      status,
      is_deductible,
      users,
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
    if (users) {
      query.eq("users.email", users);
    }
  }

  const { data, count, error } = await query.range(from, to);
  if (error) {
    console.error(error);
  }

  return { data, meta: { count: count ?? data?.length }, error };
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
  users?: string | undefined | null;
};

export async function getReimbursementsByEmployeeId({
  supabase,
  employeeId,
  params,
}: {
  supabase: TypedSupabaseClient;
  employeeId: string;
  params: {
    from: number;
    to: number;
    sort?: [string, "asc" | "desc"];
    searchQuery?: string;
    filters?: ReimbursementFilters;
  };
}) {
  const { from, to, sort, filters } = params;
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
            employee_name:employees!inner(id,first_name,middle_name,last_name),
          users!inner(id,email)`,
      { count: "exact" },
    )
    .eq("employee_id", employeeId);

  if (sort) {
    const [column, direction] = sort;
    query.order(column, { ascending: direction === "asc" });
  } else {
    query.order("created_at", { ascending: false });
  }

  if (filters) {
    const {
      submitted_date_start,
      submitted_date_end,
      status,
      is_deductible,
      users,
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
    if (users) {
      query.eq("users.email", users);
    }
  }
  const { data, count, error } = await query.range(from, to);
  if (error) {
    console.error(error);
  }

  return { data, meta: { count: count ?? data?.length }, error };
}
