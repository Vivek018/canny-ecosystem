import { defaultYear, formatUTCDate } from "@canny_ecosystem/utils";
import type {
  PayrollDatabaseRow,
  InferredType,
  TypedSupabaseClient,
  EmployeeDatabaseRow,
  SalaryEntriesDatabaseRow,
  SalaryFieldValuesDatabaseRow,
  PayrollFieldsDatabaseRow,
} from "../types";
import type { DashboardFilters } from "./exits";
import { months } from "@canny_ecosystem/utils/constant";

export type PayrollFilters = {
  date_start?: string | undefined | null;
  date_end?: string | undefined | null;
  status?: string | undefined | null;
  name?: string | undefined | null;
  month?: string | undefined | null;
  year?: string | undefined | null;
};

export type ImportSalaryPayrollDataType = {
  employee_code: EmployeeDatabaseRow["employee_code"];
};

export async function getPendingOrSubmittedPayrollsByCompanyId({
  supabase,
  companyId,
  params,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
  params: {
    to: number;
    from: number;
    searchQuery?: string;
    filters?: PayrollFilters | null;
  };
}) {
  const { from, to, filters, searchQuery } = params;
  const { date_start, date_end, status, month, year } = filters ?? {};
  const columns = [
    "id",
    "title",
    "total_employees",
    "status",
    "run_date",
    "total_net_amount",
    "month",
    "year",
    "company_id",
    "created_at",
  ] as const;

  let query = supabase
    .from("payroll")
    .select(columns.join(","), { count: "exact" })
    .eq("company_id", companyId)
    .in("status", ["pending", "submitted"]);

  if (searchQuery) {
    const searchQueryArray = searchQuery.split(" ");
    if (searchQueryArray?.length > 0 && searchQueryArray?.length <= 3) {
      for (const searchQueryElement of searchQueryArray) {
        query.or(`title.ilike.*${searchQueryElement}*`);
      }
    } else {
      query.or(`title.ilike.*${searchQuery}*`);
    }
  }

  const dateFilters = [{ field: "run_date", start: date_start, end: date_end }];
  for (const { field, start, end } of dateFilters) {
    if (start) query.gte(field, formatUTCDate(start));
    if (end) query.lte(field, formatUTCDate(end));
  }

  if (month) {
    query = query.eq("month", Number(months[month]));
    query = query.eq("year", defaultYear);
  }
  if (year) {
    query = query.eq("year", Number(year));
  }
  if (month && year) {
    query = query.eq("month", Number(months[month]));
    query = query.eq("year", Number(year));
  }

  if (status) {
    query.eq("status", status as PayrollDatabaseRow["status"]);
  }

  const { data, count, error } = await query.range(from, to);

  if (error)
    console.error("getPendingOrSubmittedPayrollsByCompanyId Error", error);

  return { data, meta: { count: count }, error };
}

export async function getApprovedPayrollsByCompanyId({
  supabase,
  companyId,
  params,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
  params: {
    to: number;
    from: number;
    searchQuery?: string;
    filters?: PayrollFilters | null;
  };
}) {
  const { from, to, filters, searchQuery } = params;
  const { date_start, date_end, status, month, year } = filters ?? {};
  const columns = [
    "id",
    "title",
    "total_employees",
    "status",
    "run_date",
    "total_net_amount",
    "month",
    "year",
    "company_id",
    "created_at",
  ] as const;

  let query = supabase
    .from("payroll")
    .select(columns.join(","), { count: "exact" })
    .eq("company_id", companyId)
    .in("status", ["approved"]);

  if (searchQuery) {
    const searchQueryArray = searchQuery.split(" ");
    if (searchQueryArray?.length > 0 && searchQueryArray?.length <= 3) {
      for (const searchQueryElement of searchQueryArray) {
        query.or(`title.ilike.*${searchQueryElement}*`);
      }
    } else {
      query.or(`title.ilike.*${searchQuery}*`);
    }
  }

  const dateFilters = [{ field: "run_date", start: date_start, end: date_end }];
  for (const { field, start, end } of dateFilters) {
    if (start) query.gte(field, formatUTCDate(start));
    if (end) query.lte(field, formatUTCDate(end));
  }
  if (month) {
    query = query.eq("month", Number(months[month]));
    query = query.eq("year", defaultYear);
  }
  if (year) {
    query = query.eq("year", Number(year));
  }
  if (month && year) {
    query = query.eq("month", Number(months[month]));
    query = query.eq("year", Number(year));
  }

  if (status) {
    query.eq("status", status as PayrollDatabaseRow["status"]);
  }

  const { data, count, error } = await query
    .range(from, to)
    .order("created_at", { ascending: false });
  if (error) console.error("getApprovedPayrollsByCompanyId Error", error);
  return { data, meta: { count: count }, error };
}

export async function getPayrollById({
  supabase,
  payrollId,
}: {
  supabase: TypedSupabaseClient;
  payrollId: string;
}) {
  const columns = [
    "id",
    "title",
    "total_employees",
    "status",
    "run_date",
    "project_id",
    "month",
    "site_id",
    "year",
    "total_net_amount",
    "company_id",
    "project_id",
    "site_id",
    "created_at",
  ] as const;

  const { data, error } = await supabase
    .from("payroll")
    .select(columns.join(","))
    .eq("id", payrollId)
    .maybeSingle<InferredType<PayrollDatabaseRow, (typeof columns)[number]>>();

  if (error) console.error("getPayrollById Error", error);

  return { data, error };
}

export const getSalaryEntriesByPayrollId = async ({
  supabase,
  payrollId,
}: {
  supabase: TypedSupabaseClient;
  payrollId: string;
}) => {
  const query = supabase
    .from("monthly_attendance")
    .select(
      `
      id,
      month,
      year,
      present_days,
      overtime_hours,
      working_days,
      absent_days,
      employee:employee_id (
        id,
        first_name,
        last_name,
        employee_code
      ),
      salary_entries!inner (
        id,
        payroll_id,
        site_id,
        department_id,
        site:sites!salary_entries_site_id_fkey (id, name, projects!left(name)),
        department:departments!salary_entries_department_id_fkey (id, name, sites!left(name)),
        salary_field_values!inner (
          id,
          amount,
          payroll_fields!inner (
            id,
            name,
            type
          )
        )
      )
    `
    )
    .eq("salary_entries.payroll_id", payrollId);

  const { data, error } = await query;

  if (error) console.error("getSalaryEntriesByPayrollId Error", error);

  return { data, error };
};

export const getSalaryEntriesByPayrollAndEmployeeId = async ({
  supabase,
  payrollId,
  employeeId,
}: {
  supabase: TypedSupabaseClient;
  payrollId: string;
  employeeId: string;
}) => {
  const query = supabase
    .from("monthly_attendance")
    .select(
      `
      id,
      month,
      year,
      present_days,
      overtime_hours,
      working_days,
      absent_days,
      employee:employee_id (
        id,
        first_name,
        middle_name,
        last_name,
        employee_code
      ),
      salary_entries!inner (
        id,
        payroll_id,
        site_id,
        department_id,
        salary_field_values!inner (
          id,
          amount,
          payroll_fields!inner (
            id,
            name,
            type
          )
        )
      )
    `
    )
    .eq("employee_id", employeeId)
    .eq("salary_entries.payroll_id", payrollId)
    .maybeSingle();

  const { data, error } = await query;

  if (error) {
    console.error("getSalaryEntriesByPayrollAndEmployeeId Error", error);
  }

  return { data, error };
};

export async function getSalaryEntryById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = ["id", "payroll_id", "monthly_attendance_id"] as const;

  const { data, error } = await supabase
    .from("salary_entries")
    .select(`${columns.join(",")}`)
    .eq("id", id)
    .single<InferredType<SalaryEntriesDatabaseRow, (typeof columns)[number]>>();

  if (error) console.error("getSalaryEntryById Error", error);

  return { data, error };
}

export async function getApprovedPayrollsAmountsByCompanyIdByMonths({
  supabase,
  companyId,
  filters,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
  filters?: DashboardFilters;
}) {
  const columns = ["run_date", "total_net_amount"] as const;
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

  const { data: currentMonth, error: currentMonthError } = await supabase
    .from("payroll")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .in("status", ["approved"])
    .gte("run_date", startOfCurrentMonth.toISOString())
    .lt("run_date", endOfCurrentMonth.toISOString())
    .order("created_at", { ascending: false })
    .returns<InferredType<PayrollDatabaseRow, (typeof columns)[number]>[]>();

  if (currentMonthError)
    console.error(
      "getApprovedPayrollsByCompanyIdByMonths Error",
      currentMonthError
    );

  //For Previous Month

  const startOfPrevMonth = filterMonth
    ? new Date(Date.UTC(Number(filterYear ?? defaultYear), filterMonth - 2, 1))
    : new Date(Date.UTC(Number(filterYear ?? defaultYear), defMonth - 1, 1));
  const endOfPrevMonth = filterMonth
    ? new Date(Number(filterYear ?? defaultYear), filterMonth - 1, 1)
    : new Date(Number(filterYear ?? defaultYear), defMonth, 1);

  const { data: previousMonth, error: previousMonthError } = await supabase
    .from("payroll")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .in("status", ["approved"])
    .gte("run_date", startOfPrevMonth.toISOString())
    .lt("run_date", endOfPrevMonth.toISOString())
    .order("created_at", { ascending: false })
    .returns<InferredType<PayrollDatabaseRow, (typeof columns)[number]>[]>();

  if (previousMonthError)
    console.error(
      "getApprovedPayrollsByCompanyIdByMonths Error",
      previousMonthError
    );

  return { currentMonth, currentMonthError, previousMonth, previousMonthError };
}

export async function getApprovedPayrollsByCompanyIdByYears({
  supabase,
  companyId,
  filters,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
  filters?: DashboardFilters;
}) {
  const columns = ["run_date", "total_net_amount"] as const;
  const defMonth = new Date().getMonth();
  const filterMonth = filters?.month && Number(months[filters.month]);
  const filterYear = filters?.year && Number(filters.year);

  const startOfYear = filterMonth
    ? new Date(Date.UTC(Number(filterYear ?? defaultYear) - 1, filterMonth, 1))
    : new Date(
        Date.UTC(Number(filterYear ?? defaultYear) - 1, defMonth + 1, 1)
      );

  const endOfYear = filterMonth
    ? new Date(Number(filterYear ?? defaultYear), filterMonth, 1)
    : new Date(Number(filterYear ?? defaultYear), defMonth + 1, 1);

  const { data, error } = await supabase
    .from("payroll")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .in("status", ["approved"])
    .gte("run_date", startOfYear.toISOString())
    .lt("run_date", endOfYear.toISOString())
    .order("run_date", { ascending: true })
    .returns<InferredType<PayrollDatabaseRow, (typeof columns)[number]>[]>();

  if (error) {
    console.error("getApprovedPayrollsByCompanyIdByYears Error", error);
    return { data: null, error };
  }

  const groupedByMonthObj: Record<string, typeof data> = {};

  const tempDate = new Date(startOfYear);
  for (let i = 0; i < 12; i++) {
    const month = tempDate.toLocaleString("default", { month: "short" });
    const year = tempDate.getFullYear();
    const key = `${month} ${year}`;
    groupedByMonthObj[key] = [];
    tempDate.setMonth(tempDate.getMonth() + 1);
  }

  for (const item of data) {
    const date = new Date(item.run_date ?? "");
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    const key = `${month} ${year}`;

    if (groupedByMonthObj[key]) {
      groupedByMonthObj[key].push(item);
    }
  }

  const groupedByMonth = Object.entries(groupedByMonthObj).map(
    ([month, data]) => ({
      month,
      data,
    })
  );

  return { data: groupedByMonth, error: null };
}

export async function getSalaryEntriesForSalaryRegisterAndAll({
  supabase,
  payrollId,
}: {
  supabase: TypedSupabaseClient;
  payrollId: string;
}) {
  const { data, error } = await supabase
    .from("monthly_attendance")
    .select(
      `
      id,
      month,
      year,
      present_days,
      overtime_hours,
      working_days,
      working_hours,
      paid_holidays,
      paid_leaves,
      casual_leaves,
      absent_days,
      employee:employee_id (
        id,
        company_id,
        first_name,
        middle_name,
        last_name,
        employee_code,
        employee_project_assignment!inner (
          position,
          start_date
        ),
        employee_statutory_details!left (
          aadhaar_number,
          pan_number,
          uan_number,
          pf_number,
          esic_number
        ),
        employee_bank_details (
          account_number,
          bank_name
        )
      ),
      salary_entries!inner (
        site_id,
        department_id,
        salary_field_values!inner (
          amount,
          payroll_fields!inner (
            name,
            type
          )
        )
      )
    `
    )
    .eq("salary_entries.payroll_id", payrollId);

  if (error) {
    console.error("getSalaryEntriesForSalaryRegisterAndAll Error", error);
  }

  return { data, error: null };
}

export async function getSalaryEntriesByEmployeeId({
  supabase,
  employeeId,
  filters,
}: {
  supabase: TypedSupabaseClient;
  employeeId: string;
  filters: DashboardFilters;
}) {
  const filterYear = filters?.year ? Number(filters.year) : defaultYear;
  const query = supabase
    .from("monthly_attendance")
    .select(
      `
      id,
      month,
      year,
      present_days,
      overtime_hours,
      working_days,
      absent_days,
      employee:employee_id (
        id,
        first_name,
        middle_name,
        last_name,
        employee_code
      ),
      salary_entries!inner (
        id,
        payroll_id,
        site_id,
        department_id,
        salary_field_values!inner (
          id,
          amount,
          payroll_fields!inner (
            id,
            name,
            type
          )
        )
      )
    `
    )
    .eq("employee_id", employeeId)
    .eq("year", filterYear)
    .gte("month", 1)
    .lte("month", 12);

  const { data, error } = await query;

  if (error) {
    console.error("getSalaryEntriesByEmployeeId Error", error);
  }

  return { data, error };
}

export async function getSalaryFieldValuesById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = ["id", "amount"] as const;

  const { data, error } = await supabase
    .from("salary_field_values")
    .select(columns.join(","))
    .eq("id", id)
    .single<
      InferredType<SalaryFieldValuesDatabaseRow, (typeof columns)[number]>
    >();

  if (error) {
    console.error("getSalaryFieldValuesById Error", error);
  }

  return { data, error };
}

export async function getPayrollFieldByPayrollId({
  supabase,
  payrollId,
}: {
  supabase: TypedSupabaseClient;
  payrollId: string;
}) {
  const columns = ["id", "name"] as const;

  const { data, error } = await supabase
    .from("payroll_fields")
    .select(columns.join(","))
    .eq("payroll_id", payrollId)
    .returns<
      InferredType<PayrollFieldsDatabaseRow, (typeof columns)[number]>[]
    >();

  if (error) {
    console.error("getPayrollFieldsByPayrollId Error", error);
  }

  return { data, error };
}

export async function getSalaryEntriesForInvoiceByInvoiceId({
  supabase,
  invoiceId,
}: {
  supabase: TypedSupabaseClient;
  invoiceId: string;
}) {
  const { data, error } = await supabase
    .from("monthly_attendance")
    .select(
      `
      id,
      month,
      year,
      present_days,
      overtime_hours,
      working_days,
      working_hours,
      paid_holidays,
      paid_leaves,
      casual_leaves,
      absent_days,
      employee:employee_id (
        id,
        company_id,
        first_name,
        middle_name,
        last_name,
        employee_code,
        employee_project_assignment!inner (
          position,
          start_date
        ),
        employee_statutory_details!left (
          aadhaar_number,
          pan_number,
          uan_number,
          pf_number,
          esic_number
        ),
        employee_bank_details (
          account_number,
          bank_name
        )
      ),
      salary_entries!inner (
        site_id,
        department_id,
        salary_field_values!inner (
          amount,
          payroll_fields!inner (
            name,
            type
          )
        )
      )
    `
    )
    .eq("salary_entries.invoice_id", invoiceId);

  if (error) {
    console.error("getSalaryEntriesForInvoiceByInvoiceId Error", error);
  }

  return { data, error: null };
}
