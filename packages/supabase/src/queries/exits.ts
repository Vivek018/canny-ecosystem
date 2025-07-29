import { defaultYear, formatUTCDate } from "@canny_ecosystem/utils";
import type {
  EmployeeDatabaseRow,
  ExitsRow,
  InferredType,
  TypedSupabaseClient,
} from "../types";
import { months } from "@canny_ecosystem/utils/constant";
export type ImportExitPayrollDataType = Pick<
  ExitsRow,
  | "employee_id"
  | "gratuity"
  | "bonus"
  | "deduction"
  | "leave_encashment"
  | "id"
  | "invoice_id"
> & {
  employee_code: EmployeeDatabaseRow["employee_code"];
};

export type ExitsPayrollEntriesWithEmployee = Omit<
  ImportExitPayrollDataType,
  "created_at" | "updated_at"
> & {
  employees: Pick<
    EmployeeDatabaseRow,
    | "first_name"
    | "middle_name"
    | "last_name"
    | "employee_code"
    | "company_id"
    | "id"
  >;
};
export type DashboardFilters = {
  month?: string | undefined | null;
  year?: string | undefined | null;
};
export type ExitFilterType = {
  last_working_day_start?: string | undefined | null;
  last_working_day_end?: string | undefined | null;
  final_settlement_date_start?: string | undefined | null;
  final_settlement_date_end?: string | undefined | null;
  reason?: string | undefined | null;
  project?: string | undefined | null;
  site?: string | undefined | null;
  in_invoice?: string | undefined | null;
} | null;

export type ImportExitDataType = Pick<
  ExitsRow,
  | "bonus"
  | "deduction"
  | "final_settlement_date"
  | "gratuity"
  | "last_working_day"
  | "leave_encashment"
  | "note"
  | "payable_days"
  | "reason"
> & { employee_code: string };

export type ExitDataType = Pick<
  ExitsRow,
  | "id"
  | "employee_id"
  | "bonus"
  | "deduction"
  | "final_settlement_date"
  | "gratuity"
  | "leave_encashment"
  | "last_working_day"
  | "final_settlement_date"
  | "note"
  | "payable_days"
  | "reason"
> & {
  employees: Pick<
    EmployeeDatabaseRow,
    "first_name" | "middle_name" | "last_name" | "employee_code"
  > & {
    employee_project_assignment: {
      sites: { name: string; projects: { name: string } };
    };
  };
};

export const getExitsByCompanyId = async ({
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
    filters?: ExitFilterType;
  };
}) => {
  const { from, to, sort, searchQuery, filters } = params;

  const {
    last_working_day_start,
    last_working_day_end,
    final_settlement_date_start,
    final_settlement_date_end,
    reason,
    project,
    site,
    in_invoice,
  } = filters ?? {};
  const foreignFilters = project || site;

  const columns = [
    "id",
    "employee_id",
    "payable_days",
    "last_working_day",
    "final_settlement_date",
    "reason",
    "bonus",
    "leave_encashment",
    "gratuity",
    "deduction",
    "note",
    "invoice_id",
  ] as const;

  const query = supabase
    .from("exits")
    .select(
      `${columns.join(",")},
          employees!inner(first_name, middle_name, last_name, employee_code, employee_project_assignment!employee_project_assignments_employee_id_fkey!${
            foreignFilters ? "inner" : "left"
          }(sites!${foreignFilters ? "inner" : "left"}(id, name, projects!${
            foreignFilters ? "inner" : "left"
          }(id, name))))`,
      { count: "exact" },
    )
    .eq("employees.company_id", companyId);

  // Sorting
  if (sort) {
    const [column, direction] = sort;
    query.order(column, { ascending: direction === "asc" });
  } else {
    query.order("created_at", { ascending: false });
  }

  // Full-text search
  if (searchQuery) {
    const searchQueryArray = searchQuery.split(" ");
    if (searchQueryArray?.length > 0 && searchQueryArray?.length <= 3) {
      for (const searchQueryElement of searchQueryArray) {
        query.or(
          `first_name.ilike.*${searchQueryElement}*,middle_name.ilike.*${searchQueryElement}*,last_name.ilike.*${searchQueryElement}*,employee_code.ilike.*${searchQueryElement}*`,
          {
            referencedTable: "employees",
          },
        );
      }
    } else {
      query.or(
        `first_name.ilike.*${searchQuery}*,middle_name.ilike.*${searchQuery}*,last_name.ilike.*${searchQuery}*,employee_code.ilike.*${searchQuery}*`,
        {
          referencedTable: "employees",
        },
      );
    }
  }

  const dateFilters = [
    {
      field: "last_working_day",
      start: last_working_day_start,
      end: last_working_day_end,
    },
    {
      field: "final_settlement_date",
      start: final_settlement_date_start,
      end: final_settlement_date_end,
    },
  ];

  for (const { field, start, end } of dateFilters) {
    if (start) query.gte(field, formatUTCDate(start));
    if (end) query.lte(field, formatUTCDate(end));
  }

  if (reason) query.eq("reason", reason.toLowerCase());

  if (project) {
    query.eq(
      "employees.employee_project_assignment.sites.projects.name",
      project,
    );
  }
  if (site) {
    query.eq("employees.employee_project_assignment.sites.name", site);
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
    console.error("getExits Error", error);
  }

  return { data, meta: { count: count }, error };
};

export const getExitsById = async ({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) => {
  const columns = [
    "id",
    "employee_id",
    "payable_days",
    "last_working_day",
    "final_settlement_date",
    "reason",
    "bonus",
    "leave_encashment",
    "gratuity",
    "deduction",
    "note",
    "invoice_id",
  ] as const;

  const { data, error } = await supabase
    .from("exits")
    .select(columns.join(","))
    .eq("id", id)
    .single<InferredType<ExitsRow, (typeof columns)[number]>>();

  if (error) console.error("getExitsById Error", error);

  return { data, error };
};

export const getExitByEmployeeId = async ({
  supabase,
  employeeId,
}: {
  supabase: TypedSupabaseClient;
  employeeId: string;
}) => {
  const columns = [
    "id",
    "employee_id",
    "payable_days",
    "last_working_day",
    "final_settlement_date",
    "reason",
    "note",
    "leave_encashment",
    "gratuity",
    "deduction",
    "bonus",
  ] as const;

  const { data, error } = await supabase
    .from("exits")
    .select(columns.join(","))
    .eq("employee_id", employeeId)
    .maybeSingle<InferredType<ExitsRow, (typeof columns)[number]>>();

  if (error) console.error("getExitByEmployeeId Error", error);

  return { data, error };
};

export type RecentExitsType = Pick<
  ExitsRow,
  | "id"
  | "last_working_day"
  | "payable_days"
  | "final_settlement_date"
  | "bonus"
  | "leave_encashment"
  | "gratuity"
> & {
  employees: Pick<
    EmployeeDatabaseRow,
    "id" | "first_name" | "middle_name" | "last_name" | "employee_code"
  > & {};
};

export const getExitsByCompanyIdByMonths = async ({
  supabase,
  companyId,
  filters,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
  filters?: DashboardFilters;
}) => {
  const columns = ["id"] as const;
  const defMonth = new Date().getMonth();
  const filterMonth = filters?.month && Number(months[filters.month]);
  const filterYear = filters?.year && Number(filters.year);

  //For Current Month
  const startOfCurrentMonth = filterMonth
    ? new Date(Date.UTC(Number(filterYear ?? defaultYear), filterMonth - 1, 1))
    : new Date(Date.UTC(Number(filterYear ?? defaultYear), defMonth, 1));

  const endOfCurrentMonth = filterMonth
    ? new Date(Number(filterYear ?? defaultYear), filterMonth, 1)
    : new Date(Number(filterYear ?? defaultYear), defMonth + 1, 1);

  const currentQuery = supabase
    .from("exits")
    .select(
      `${columns.join(",")},
          employees!inner(employee_code)`,
    )
    .eq("employees.company_id", companyId)
    .gte("created_at", startOfCurrentMonth.toISOString())
    .lt("created_at", endOfCurrentMonth.toISOString());

  const { data: currentMonthExits, error: currentMonthExitErrors } =
    await currentQuery;

  if (currentMonthExitErrors) {
    console.error("getExitsFor CurrentMonth Error", currentMonthExitErrors);
  }

  //For Previous Month
  const startOfPrevMonth = filterMonth
    ? new Date(Date.UTC(Number(filterYear ?? defaultYear), filterMonth - 2, 1))
    : new Date(Date.UTC(Number(filterYear ?? defaultYear), defMonth - 1, 1));
  const endOfPrevMonth = filterMonth
    ? new Date(Number(filterYear ?? defaultYear), filterMonth - 1, 1)
    : new Date(Number(filterYear ?? defaultYear), defMonth, 1);

  const prevQuery = supabase
    .from("exits")
    .select(
      `${columns.join(",")},
          employees!inner(employee_code)`,
    )
    .eq("employees.company_id", companyId)
    .gte("created_at", startOfPrevMonth.toISOString())
    .lt("created_at", endOfPrevMonth.toISOString());

  const { data: previousMonthExits, error: previousMonthExitErrors } =
    await prevQuery;

  if (previousMonthExitErrors) {
    console.error("getExitsFor previousMonth Error", previousMonthExitErrors);
  }

  return {
    currentMonthExits,
    currentMonthExitErrors,
    previousMonthExits,
    previousMonthExitErrors,
  };
};

export async function getExitsEntriesForPayrollByPayrollId({
  supabase,
  payrollId,
}: {
  supabase: TypedSupabaseClient;
  payrollId: string;
}) {
  const columns = [
    "id",
    "employee_id",
    "invoice_id",
    "gratuity",
    "bonus",
    "leave_encashment",
    "deduction",
    "created_at",
  ] as const;

  const { data, error } = await supabase
    .from("exits")
    .select(
      `${columns.join(
        ",",
      )}, employees!left(id,company_id,first_name, middle_name, last_name, employee_code)`,
    )
    .eq("invoice_id", payrollId)
    .order("created_at", { ascending: false })
    .returns<ExitsPayrollEntriesWithEmployee[]>();

  if (error) console.error("getExitsEntriesForPayrollByPayrollId Error", error);

  return { data, error };
}

export async function getExitsEntryForPayrollById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "id",
    "employee_id",
    "gratuity",
    "bonus",
    "leave_encashment",
    "deduction",
    "invoice_id",
  ] as const;

  const { data, error } = await supabase
    .from("exits")
    .select(
      `${columns.join(
        ",",
      )}, employees!left(id,company_id,first_name, middle_name, last_name, employee_code)`,
    )
    .eq("id", id)
    .single<ExitsPayrollEntriesWithEmployee>();

  if (error) console.error("getExitsforPayrollEntryById Error", error);

  return { data, error };
}

export async function getExitEntriesByPayrollIdForInvoicePreview({
  supabase,
  invoiceId,
}: {
  supabase: TypedSupabaseClient;
  invoiceId: string;
}) {
  const columns = [
    "id",
    "gratuity",
    "bonus",
    "leave_encashment",
    "deduction",
    "invoice_id",
  ] as const;

  const { data, error } = await supabase
    .from("employees")
    .select(
      `id, company_id, first_name, middle_name, last_name, employee_code, exits!inner(${columns.join(
        ",",
      )})`,
    )
    .eq("exits.invoice_id", invoiceId)
    .returns<ExitsPayrollEntriesWithEmployee[]>();

  if (error) {
    console.error("getPayrollEntriesByPayrollId Error", error);
  }
  const mapped = data?.map((emp: any) => ({
    ...emp,
    exits: emp.exits.map(
      ({
        bonus = 0,
        gratuity = 0,
        leave_encashment = 0,
        deduction = 0,
      }: any) => ({
        amount: bonus + gratuity + leave_encashment - deduction,
      }),
    ),
  }));

  return { data: mapped, error: null };
}
