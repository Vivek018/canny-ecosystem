import { formatUTCDate } from "@canny_ecosystem/utils";
import type {
  EmployeeDatabaseRow,
  EmployeeProjectAssignmentDatabaseRow,
  InferredType,
  ProjectDatabaseRow,
  ReimbursementRow,
  SiteDatabaseRow,
  TypedSupabaseClient,
  UserDatabaseRow,
} from "../types";

export type ImportReimbursementDataType = Pick<
  ReimbursementRow,
  "amount" | "status" | "submitted_date"
> & { email: UserDatabaseRow["email"] } & {
  employee_code: EmployeeDatabaseRow["employee_code"];
};

export type ReimbursementDataType = Pick<
  ReimbursementRow,
  | "id"
  | "employee_id"
  | "note"
  | "status"
  | "type"
  | "amount"
  | "submitted_date"
  | "user_id"
  | "invoice_id"
  | "company_id"
> & {
  employees: Pick<
    EmployeeDatabaseRow,
    "first_name" | "middle_name" | "last_name" | "employee_code"
  > & {
    employee_project_assignment: Pick<
      EmployeeProjectAssignmentDatabaseRow,
      "employee_id"
    > & {
      sites: {
        id: SiteDatabaseRow["id"];
        name: SiteDatabaseRow["name"];
        projects: {
          id: ProjectDatabaseRow["id"];
          name: ProjectDatabaseRow["name"];
        };
      };
    };
  };
} & {
  users: Pick<UserDatabaseRow, "id" | "email">;
};

export type ImportReimbursementPayrollDataType = Pick<
  ReimbursementRow,
  | "employee_id"
  | "amount"
  | "id"
  | "invoice_id"
  | "company_id"
  | "type"
  | "note"
> & {
  employee_code: EmployeeDatabaseRow["employee_code"];
};

export type ReimbursementPayrollEntriesWithEmployee = Omit<
  ImportReimbursementPayrollDataType,
  "created_at" | "updated_at"
> & {
  employees: Pick<
    EmployeeDatabaseRow,
    "first_name" | "middle_name" | "last_name" | "employee_code" | "id"
  >;
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
    filters?: ReimbursementFilters | null;
  };
}) {
  const { from, to, sort, searchQuery, filters } = params;

  const {
    submitted_date_start,
    submitted_date_end,
    status,
    users,
    type,
    project,
    site,
    in_invoice,
  } = filters ?? {};
  const foreignFilters = project || site;

  const columns = [
    "id",
    "status",
    "amount",
    "note",
    "type",
    "submitted_date",
    "employee_id",
    "invoice_id",
    "company_id",
  ] as const;

  const query = supabase
    .from("reimbursements")
    .select(
      `${columns.join(",")},
          employees!left(first_name, middle_name, last_name, employee_code, employee_project_assignment!employee_project_assignments_employee_id_fkey!${foreignFilters ? "inner" : "left"
      }(sites!${foreignFilters ? "inner" : "left"}(id, name, projects!${foreignFilters ? "inner" : "left"
      }(id, name)))),
          users!${users ? "inner" : "left"}(id,email)`,
      { count: "exact" }
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
          `first_name.ilike.*${searchQueryElement}*,middle_name.ilike.*${searchQueryElement}*,last_name.ilike.*${searchQueryElement}*,employee_code.ilike.*${searchQueryElement}*`,
          {
            referencedTable: "employees",
          }
        );
        query.or(`name.ilike.*${searchQueryElement}*`, {
          referencedTable: "reimbursement",
        });
      }
    } else {
      query.or(
        `first_name.ilike.*${searchQuery}*,middle_name.ilike.*${searchQuery}*,last_name.ilike.*${searchQuery}*,employee_code.ilike.*${searchQuery}*`,
        {
          referencedTable: "employees",
        }
      );
      query.or(`name.ilike.*${searchQuery}*`, {
        referencedTable: "reimbursement",
      });
    }
  }

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

  if (users) {
    query.eq("users.email", users);
  }
  if (type) {
    query.eq("type", type);
  }
  if (project) {
    query.eq(
      "employees.employee_project_assignment.sites.projects.name",
      project
    );
  }
  if (site) {
    query.eq(
      "employees.employee_project_assignment.sites.name",
      site
    );
  }

  if (in_invoice !== undefined && in_invoice !== null) {
    if (in_invoice === "true") {
      query.not("invoice_id", "is", null);
    } else {
      query.is("invoice_id", null);
    }
  }

  const { data, count, error } = await query.range(from, to);
  if (error) {
    console.error("getReimbursementsByCompanyId Error", error);
  }

  return { data, meta: { count }, error };
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
    "note",
    "status",
    "amount",
    "type",
    "submitted_date",
    "user_id",
    "invoice_id",
    "company_id",
  ] as const;

  const { data, error } = await supabase
    .from("reimbursements")
    .select(columns.join(","))
    .eq("id", reimbursementId)
    .single<InferredType<ReimbursementRow, (typeof columns)[number]>>();

  if (error) {
    console.error("getReimbursementsById Error", error);
  }

  return { data, error };
}

export type ReimbursementFilters = {
  submitted_date_start?: string | undefined | null;
  submitted_date_end?: string | undefined | null;
  status?: string | undefined | null;
  users?: string | undefined | null;
  project?: string | undefined | null;
  name?: string | undefined | null;
  site?: string | undefined | null;
  type?: string | undefined | null;
  in_invoice?: string | undefined | null;
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
    filters?: ReimbursementFilters | null;
  };
}) {
  const { from, to, sort, filters } = params;

  const { submitted_date_start, submitted_date_end, status, users, type } =
    filters ?? {};

  const columns = [
    "id",
    "employee_id",
    "note",
    "status",
    "type",
    "amount",
    "submitted_date",
    "company_id",
  ] as const;

  const query = supabase
    .from("reimbursements")
    .select(
      `${columns.join(",")},
          employees!inner(id, first_name, middle_name, last_name, employee_code, employee_project_assignment!employee_project_assignments_employee_id_fkey!left(sites, name, projects!left(id, name)))),
          users!${users ? "inner" : "left"}(id,email)`,
      { count: "exact" }
    )
    .eq("employee_id", employeeId);

  if (sort) {
    const [column, direction] = sort;
    query.order(column, { ascending: direction === "asc" });
  } else {
    query.order("created_at", { ascending: false });
  }

  if (filters) {
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
    if (type) {
      query.eq("type", type);
    }
    if (users) {
      query.eq("users.email", users);
    }
  }
  const { data, count, error } = await query.range(from, to);
  if (error) {
    console.error("getReimbursementsByEmployeeId Error", error);
  }

  return { data, meta: { count: count }, error };
}

export type RecentReimbursementType = Pick<
  ReimbursementRow,
  "id" | "amount" | "status" | "submitted_date" | "company_id" | "note" | "type"
> & {
  employees: Pick<
    EmployeeDatabaseRow,
    "id" | "first_name" | "middle_name" | "last_name" | "employee_code"
  > & {};
};

export async function getReimbursementEntriesForPayrollByPayrollId({
  supabase,
  payrollId,
}: {
  supabase: TypedSupabaseClient;
  payrollId: string;
}) {
  const columns = [
    "id",
    "employee_id",
    "note",
    "amount",
    "type",
    "invoice_id",
    "created_at",
    "company_id",
  ] as const;

  const { data, error } = await supabase
    .from("reimbursements")
    .select(
      `${columns.join(
        ","
      )}, employees!left(id, first_name, middle_name, last_name, employee_code)`
    )
    .eq("payroll_id", payrollId)
    .order("created_at", { ascending: false })
    .returns<ReimbursementPayrollEntriesWithEmployee[]>();

  if (error)
    console.error("getReimbursementEntriesForPayrollByPayrollId Error", error);

  return { data, error };
}

export async function getReimbursementEntryForPayrollById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "id",
    "employee_id",
    "note",
    "type",
    "amount",
    "invoice_id",
    "company_id",
  ] as const;

  const { data, error } = await supabase
    .from("reimbursements")
    .select(
      `${columns.join(
        ","
      )}, employees!left(id,first_name, middle_name, last_name, employee_code)`
    )
    .eq("id", id)
    .single<ReimbursementPayrollEntriesWithEmployee>();

  if (error) console.error("getReimbursementforPayrollEntryById Error", error);

  return { data, error };
}

export async function getReimbursementEntriesByInvoiceIdForInvoicePreview({
  supabase,
  invoiceId,
}: {
  supabase: TypedSupabaseClient;
  invoiceId: string;
}) {
  const columns = ["amount"] as const;

  const { data, error } = await supabase
    .from("employees")
    .select(
      `id, company_id, first_name, middle_name, last_name, employee_code, reimbursements!inner(${columns.join(
        ","
      )})`
    )
    .eq("reimbursements.invoice_id", invoiceId)
    .returns<ReimbursementPayrollEntriesWithEmployee[]>();

  if (error) {
    console.error("getPayrollEntriesByPayrollId Error", error);
  }

  return { data, error: null };
}
