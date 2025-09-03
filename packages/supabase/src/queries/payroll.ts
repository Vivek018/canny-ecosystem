import {
  defaultMonth,
  defaultYear,
  formatUTCDate,
} from "@canny_ecosystem/utils";
import type {
  PayrollDatabaseRow,
  InferredType,
  TypedSupabaseClient,
  EmployeeDatabaseRow,
  SalaryEntriesDatabaseRow,
  SalaryFieldValuesDatabaseRow,
  PayrollFieldsDatabaseRow,
  InvoiceDatabaseRow,
} from "../types";
import type { DashboardFilters } from "./exits";
import { months } from "@canny_ecosystem/utils/constant";
import { SOFT_QUERY_LIMIT } from "../constant";

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
    .order("created_at", { ascending: false })
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
    .order("created_at", { ascending: false })
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

  const { data, count, error } = await query.range(from, to);
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
    .select(`${columns.join(",")},sites(name),projects(name)`)
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
        invoice_id,
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
    `,
    )
    .eq("salary_entries.payroll_id", payrollId)
    .limit(SOFT_QUERY_LIMIT);

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
        site:sites!salary_entries_site_id_fkey (name, projects!left(name),company_locations!left(name,address_line_1,address_line_2,city,state,pincode)),
        department:departments!salary_entries_department_id_fkey (name, sites!left(name)),
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
    `,
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

  const monthFilter = filters?.month
    ? Number(months[filters?.month])
    : defaultMonth;
  const yearFilter = filters?.year ? Number(filters?.year) : defaultYear;

  const { data: currentMonth, error: currentMonthError } = await supabase
    .from("payroll")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .in("status", ["approved"])
    .eq("month", monthFilter)
    .eq("year", yearFilter)
    .order("created_at", { ascending: false })
    .returns<InferredType<PayrollDatabaseRow, (typeof columns)[number]>[]>();

  if (currentMonthError)
    console.error(
      "getApprovedPayrollsByCompanyIdByMonths Error",
      currentMonthError,
    );

  const { data: previousMonth, error: previousMonthError } = await supabase
    .from("payroll")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .in("status", ["approved"])
    .eq("month", monthFilter - 1)
    .eq("year", yearFilter)
    .order("created_at", { ascending: false })
    .returns<InferredType<PayrollDatabaseRow, (typeof columns)[number]>[]>();

  if (previousMonthError)
    console.error(
      "getApprovedPayrollsByCompanyIdByMonths Error",
      previousMonthError,
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
  const payrollColumns = ["month", "year", "total_net_amount"] as const;
  const restColumns = ["paid_date", "payroll_data"] as const;
  const filterMonth = filters?.month
    ? Number(months[filters.month])
    : defaultMonth;
  const filterYear = filters?.year ? Number(filters.year) : defaultYear;

  const startOfYear = new Date(
    Date.UTC(Number(filterYear) - 1, filterMonth, 1),
  );

  const endOfYear = new Date(Number(filterYear), filterMonth, 1);

  const startMonth = filterMonth === 12 ? 1 : filterMonth + 1;
  const startYear = filterMonth === 12 ? filterYear : filterYear - 1;
  const endMonth = filterMonth;
  const endYear = filterYear;

  const { data: payrollData, error: payrollError } = await supabase
    .from("payroll")
    .select(payrollColumns.join(","))
    .eq("company_id", companyId)
    .in("status", ["approved"])
    .or(
      `and(year.eq.${startYear},month.gte.${startMonth}),and(year.eq.${endYear},month.lte.${endMonth})`,
    )

    .order("run_date", { ascending: true })
    .returns<
      InferredType<PayrollDatabaseRow, (typeof payrollColumns)[number]>[]
    >();

  if (payrollError) {
    console.error("getApprovedPayrollsByCompanyIdByYears Error", payrollError);
    return { data: null, payrollError };
  }

  const { data: restData, error: restError } = await supabase
    .from("invoice")
    .select(restColumns.join(","))
    .eq("company_id", companyId)
    .in("type", ["reimbursement", "exit"])
    .in("is_paid", [true])
    .gte("paid_date", startOfYear.toISOString())
    .lt("paid_date", endOfYear.toISOString())
    .order("paid_date", { ascending: true })
    .returns<
      InferredType<InvoiceDatabaseRow, (typeof restColumns)[number]>[]
    >();

  if (restError) {
    console.error("getApprovedPayrollsByCompanyIdByYears Error", restError);
    return { data: null, restError };
  }

  const groupedByMonthObj: Record<string, typeof payrollData> = {};

  const tempDate = new Date(startOfYear);

  for (let i = 0; i < 12; i++) {
    const month = tempDate.toLocaleString("default", { month: "short" });
    const year = tempDate.getFullYear();
    const key = `${month} ${year}`;
    groupedByMonthObj[key] = [];
    tempDate.setMonth(tempDate.getMonth() + 1);
  }

  for (const item of payrollData) {
    const monthName = new Date(item.year!, item.month! - 1).toLocaleString(
      "default",
      { month: "short" },
    );
    const key = `${monthName} ${item.year}`;

    if (groupedByMonthObj[key]) {
      groupedByMonthObj[key].push(item);
    }
  }

  const groupedByMonth = Object.entries(groupedByMonthObj).map(
    ([month, data]) => ({
      month,
      data,
    }),
  );

  for (const item of restData) {
    const date = new Date(item.paid_date ?? "");
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    const key = `${month} ${year}`;
    const amount = Number((item.payroll_data as any)?.[0]?.amount ?? 0);

    const monthEntry: any = groupedByMonth.find((entry) => entry.month === key);

    if (monthEntry) {
      if (monthEntry.data.length > 0) {
        monthEntry.data[0].total_net_amount += amount;
      } else {
        monthEntry.data.push({ total_net_amount: amount });
      }
    }
  }

  return { data: groupedByMonth };
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
        employee_project_assignment!left (
          position,
          start_date,
          sites(name, projects(name),company_locations!left(name,address_line_1,address_line_2,city,state,pincode))
        ),
        employee_statutory_details!left (
          aadhaar_number,
          pan_number,
          uan_number,
          pf_number,
          esic_number
        ),
        employee_bank_details!left (
          account_number,
          bank_name
        )
      ),
      salary_entries!inner (
        site_id,
        department_id,
        site:sites!salary_entries_site_id_fkey!left (name, projects!left(name),company_locations!left(name,address_line_1,address_line_2,city,state,pincode)),
        department:departments!salary_entries_department_id_fkey!left (name, sites!left(name)),
        salary_field_values!inner (
          amount,
          payroll_fields!inner (
            name,
            type
          )
        )
      )
    `,
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
    `,
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
  const columns = ["id", "name", "type", "payroll_id", "created_at"] as const;

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
        employee_project_assignment!left (
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
        employee_bank_details!left (
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
    `,
    )
    .eq("salary_entries.invoice_id", invoiceId);

  if (error) {
    console.error("getSalaryEntriesForInvoiceByInvoiceId Error", error);
  }

  return { data, error: null };
}

export const getSalaryEntriesByPayrollIdForAddingSalaryEntry = async ({
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
      salary_entries!inner (
        id)       
    `,
    )
    .eq("salary_entries.payroll_id", payrollId);

  const { data, error } = await query;

  if (error)
    console.error(
      "getSalaryEntriesByPayrollIdForAddingSalaryEntry Error",
      error,
    );

  return { data, error };
};

/////////////////////////////////////////////////////////////////////

export async function getApprovedPayrollsBySiteIdsAndProjectIds({
  supabase,
  siteIds,
  params,
  projectIds,
}: {
  supabase: TypedSupabaseClient;
  siteIds: string[];
  projectIds: string[];
  params: {
    from: number;
    to: number;
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
    .or(
      `project_id.in.(${projectIds.join(",")}),site_id.in.(${siteIds.join(",")})`,
    )
    .order("created_at", { ascending: false })
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

  const { data, count, error } = await query.range(from, to);
  if (error) console.error("getApprovedPayrollsBySiteIds Error", error);
  return { data, meta: { count: count }, error };
}

export async function getApprovedPayrollsAmountsBySiteIdsAndProjectIdsByMonths({
  supabase,
  siteIds,
  projectIds,
  filters,
}: {
  supabase: TypedSupabaseClient;
  siteIds: string[];
  projectIds: string[];
  filters?: DashboardFilters;
}) {
  const columns = ["run_date", "total_net_amount"] as const;

  const monthFilter = filters?.month
    ? Number(months[filters?.month])
    : defaultMonth;
  const yearFilter = filters?.year ? Number(filters?.year) : defaultYear;

  const { data: currentMonth, error: currentMonthError } = await supabase
    .from("payroll")
    .select(columns.join(","))
    .or(
      `project_id.in.(${projectIds.join(",")}),site_id.in.(${siteIds.join(",")})`,
    )
    .in("status", ["approved"])
    .eq("month", monthFilter)
    .eq("year", yearFilter)
    .order("created_at", { ascending: false })
    .returns<InferredType<PayrollDatabaseRow, (typeof columns)[number]>[]>();

  if (currentMonthError)
    console.error(
      "getApprovedPayrollsByCompanyIdByMonths Error",
      currentMonthError,
    );

  const { data: previousMonth, error: previousMonthError } = await supabase
    .from("payroll")
    .select(columns.join(","))
    .or(
      `project_id.in.(${projectIds.join(",")}),site_id.in.(${siteIds.join(",")})`,
    )
    .in("status", ["approved"])
    .eq("month", monthFilter - 1)
    .eq("year", yearFilter)
    .order("created_at", { ascending: false })
    .returns<InferredType<PayrollDatabaseRow, (typeof columns)[number]>[]>();

  if (previousMonthError)
    console.error(
      "getApprovedPayrollsByCompanyIdByMonths Error",
      previousMonthError,
    );

  return { currentMonth, currentMonthError, previousMonth, previousMonthError };
}

export async function getApprovedPayrollsBySiteIdsAndProjectIdsByYears({
  supabase,
  siteIds,
  projectIds,
  filters,
  locationId,
}: {
  supabase: TypedSupabaseClient;
  siteIds: string[];
  projectIds: string[];
  filters?: DashboardFilters;
  locationId: string;
}) {
  const payrollColumns = ["month", "year", "total_net_amount"] as const;
  const restColumns = ["paid_date", "payroll_data"] as const;
  const filterMonth = filters?.month
    ? Number(months[filters.month])
    : defaultMonth;
  const filterYear = filters?.year ? Number(filters.year) : defaultYear;

  const startOfYear = new Date(
    Date.UTC(Number(filterYear) - 1, filterMonth, 1),
  );

  const endOfYear = new Date(Number(filterYear), filterMonth, 1);

  const startMonth = filterMonth === 12 ? 1 : filterMonth + 1;
  const startYear = filterMonth === 12 ? filterYear : filterYear - 1;
  const endMonth = filterMonth;
  const endYear = filterYear;

  const { data: payrollData, error: payrollError } = await supabase
    .from("payroll")
    .select(payrollColumns.join(","))
    .or(
      `project_id.in.(${projectIds.join(",")}),site_id.in.(${siteIds.join(",")})`,
    )
    .in("status", ["approved"])
    .or(
      `and(year.eq.${startYear},month.gte.${startMonth}),and(year.eq.${endYear},month.lte.${endMonth})`,
    )

    .order("run_date", { ascending: true })
    .returns<
      InferredType<PayrollDatabaseRow, (typeof payrollColumns)[number]>[]
    >();

  if (payrollError) {
    console.error("getApprovedPayrollsByCompanyIdByYears Error", payrollError);
    return { data: null, payrollError };
  }

  const { data: restData, error: restError } = await supabase
    .from("invoice")
    .select(restColumns.join(","))
    .eq("company_address_id", locationId)
    .in("type", ["reimbursement", "exit"])
    .in("is_paid", [true])
    .gte("paid_date", startOfYear.toISOString())
    .lt("paid_date", endOfYear.toISOString())
    .order("paid_date", { ascending: true })
    .returns<
      InferredType<InvoiceDatabaseRow, (typeof restColumns)[number]>[]
    >();

  if (restError) {
    console.error("getApprovedPayrollsByCompanyIdByYears Error", restError);
    return { data: null, restError };
  }

  const groupedByMonthObj: Record<string, typeof payrollData> = {};

  const tempDate = new Date(startOfYear);

  for (let i = 0; i < 12; i++) {
    const month = tempDate.toLocaleString("default", { month: "short" });
    const year = tempDate.getFullYear();
    const key = `${month} ${year}`;
    groupedByMonthObj[key] = [];
    tempDate.setMonth(tempDate.getMonth() + 1);
  }

  for (const item of payrollData) {
    const monthName = new Date(item.year!, item.month! - 1).toLocaleString(
      "default",
      { month: "short" },
    );
    const key = `${monthName} ${item.year}`;

    if (groupedByMonthObj[key]) {
      groupedByMonthObj[key].push(item);
    }
  }

  const groupedByMonth = Object.entries(groupedByMonthObj).map(
    ([month, data]) => ({
      month,
      data,
    }),
  );

  for (const item of restData) {
    const date = new Date(item.paid_date ?? "");
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    const key = `${month} ${year}`;
    const amount = Number((item.payroll_data as any)?.[0]?.amount ?? 0);

    const monthEntry: any = groupedByMonth.find((entry) => entry.month === key);

    if (monthEntry) {
      if (monthEntry.data.length > 0) {
        monthEntry.data[0].total_net_amount += amount;
      } else {
        monthEntry.data.push({ total_net_amount: amount });
      }
    }
  }

  return { data: groupedByMonth };
}
