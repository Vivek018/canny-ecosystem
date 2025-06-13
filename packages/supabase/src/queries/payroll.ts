import { defaultYear, formatUTCDate } from "@canny_ecosystem/utils";
import type {
  PayrollDatabaseRow,
  InferredType,
  TypedSupabaseClient,
  PayrollEntriesDatabaseRow,
  EmployeeDatabaseRow,
  SalaryEntriesDatabaseRow,
} from "../types";
import type { DashboardFilters } from "./exits";
import { months } from "@canny_ecosystem/utils/constant";

export type PayrollFilters = {
  date_start?: string | undefined | null;
  date_end?: string | undefined | null;
  payroll_type?: string | undefined | null;
  status?: string | undefined | null;
  name?: string | undefined | null;
};

export type ImportPayrollDataType = Pick<
  PayrollEntriesDatabaseRow,
  "employee_id" | "amount"
> & {
  employee_code: EmployeeDatabaseRow["employee_code"];
};

export type ImportSalaryPayrollDataType = {
  employee_code: EmployeeDatabaseRow["employee_code"];
  present_days: number;
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
  const { date_start, date_end, payroll_type, status } = filters ?? {};
  const columns = [
    "id",
    "title",
    "total_employees",
    "payroll_type",
    "status",
    "run_date",
    "total_net_amount",
    "company_id",
    "created_at",
  ] as const;

  const query = supabase
    .from("payroll")
    .select(columns.join(","), { count: "exact" })
    .eq("company_id", companyId)
    .in("status", ["pending", "submitted"]);

  if (searchQuery) {
    query.or(`title.ilike.*${searchQuery}*`);
  }

  const dateFilters = [{ field: "run_date", start: date_start, end: date_end }];
  for (const { field, start, end } of dateFilters) {
    if (start) query.gte(field, formatUTCDate(start));
    if (end) query.lte(field, formatUTCDate(end));
  }

  if (payroll_type) {
    query.eq("payroll_type", payroll_type);
  }

  if (status) {
    query.eq("status", status);
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
  const { date_start, date_end, payroll_type, status } = filters ?? {};
  const columns = [
    "id",
    "title",
    "total_employees",
    "payroll_type",
    "status",
    "run_date",
    "total_net_amount",
    "company_id",
    "created_at",
  ] as const;

  const query = supabase
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

  if (payroll_type) {
    query.eq("payroll_type", payroll_type);
  }

  if (status) {
    query.eq("status", status);
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
    "payroll_type",
    "status",
    "run_date",
    "total_net_amount",
    "company_id",
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

export type PayrollEntriesWithEmployee = Omit<
  PayrollEntriesDatabaseRow,
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

export type SalaryEntriesWithEmployee = Pick<
  EmployeeDatabaseRow,
  | "first_name"
  | "middle_name"
  | "last_name"
  | "employee_code"
  | "company_id"
  | "id"
> & {
  salary_entries: Omit<SalaryEntriesDatabaseRow, "created_at" | "updated_at">[];
  leaves?: { start_date: string; end_date: string; status: string }[];
};

export async function getSalaryEntriesByPayrollId({
  supabase,
  payrollId,
}: {
  supabase: TypedSupabaseClient;
  payrollId: string;
}) {
  const columns = [
    "id",
    "month",
    "year",
    "present_days",
    "overtime_hours",
    "employee_id",
    "template_component_id",
    "payroll_id",
    "field_name",
    "type",
    "amount",
    "is_pro_rata",
    "consider_for_epf",
    "consider_for_esic",
  ] as const;

  const { data, error } = await supabase
    .from("employees")
    .select(
      `id, company_id, first_name, middle_name, last_name, employee_code, salary_entries!inner(${columns.join(
        ","
      )})`
    )
    .eq("salary_entries.payroll_id", payrollId)
    .order("type, field_name", {
      ascending: true,
      referencedTable: "salary_entries",
    })
    .returns<SalaryEntriesWithEmployee[]>();

  if (error) {
    console.error("getSalaryEntriesByPayrollId Error", error);
  }

  return { data, error };
}

export async function getSalaryEntriesByPayrollAndEmployeeId({
  supabase,
  payrollId,
  employeeId,
}: {
  supabase: TypedSupabaseClient;
  payrollId: string;
  employeeId: string;
}) {
  const columns = [
    "id",
    "month",
    "year",
    "present_days",
    "overtime_hours",
    "employee_id",
    "template_component_id",
    "payroll_id",
    "field_name",
    "type",
    "amount",
    "is_pro_rata",
    "consider_for_epf",
    "consider_for_esic",
  ] as const;

  const { data, error } = await supabase
    .from("employees")
    .select(
      `id, company_id, first_name, middle_name, last_name, employee_code, salary_entries!inner(${columns.join(
        ","
      )}),leaves(start_date,end_date,leave_type)`
    )
    .eq("salary_entries.payroll_id", payrollId)
    .eq("id", employeeId)
    .single<SalaryEntriesWithEmployee>();

  if (error) {
    console.error("getSalaryEntriesByPayrollAndEmployeeId Error", error);
  }

  return { data, error };
}

export async function getSalaryEntryById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "id",
    "month",
    "year",
    "present_days",
    "overtime_hours",
    "employee_id",
    "template_component_id",
    "payroll_id",
    "field_name",
    "type",
    "amount",
    "is_pro_rata",
    "consider_for_epf",
    "consider_for_esic",
  ] as const;

  const { data, error } = await supabase
    .from("salary_entries")
    .select(`${columns.join(",")}`)
    .eq("id", id)
    .single<InferredType<SalaryEntriesDatabaseRow, (typeof columns)[number]>>();

  if (error) console.error("getSalaryEntryById Error", error);

  return { data, error };
}

export async function getPayrollEntriesByPayrollId({
  supabase,
  payrollId,
}: {
  supabase: TypedSupabaseClient;
  payrollId: string;
}) {
  const columns = [
    "id",
    "employee_id",
    "reimbursement_id",
    "exit_id",
    "payment_status",
    "amount",
    "payroll_id",
    "created_at",
  ] as const;

  const { data, error } = await supabase
    .from("payroll_entries")
    .select(
      `${columns.join(
        ","
      )}, employees!left(id,company_id,first_name, middle_name, last_name, employee_code)`
    )
    .eq("payroll_id", payrollId)
    .order("created_at", { ascending: false })
    .returns<PayrollEntriesWithEmployee[]>();

  if (error) console.error("getPayrollEntriesByPayrollId Error", error);

  return { data, error };
}

export async function getPayrollEntryById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "id",
    "employee_id",
    "reimbursement_id",
    "exit_id",
    "payment_status",
    "amount",
    "payroll_id",
  ] as const;

  const { data, error } = await supabase
    .from("payroll_entries")
    .select(
      `${columns.join(
        ","
      )}, employees!left(id,company_id,first_name, middle_name, last_name, employee_code)`
    )
    .eq("id", id)
    .single<PayrollEntriesWithEmployee>();

  if (error) console.error("getPayrollEntryById Error", error);

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
  const columns = ["payroll_type", "run_date", "total_net_amount"] as const;
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
  const columns = ["payroll_type", "run_date", "total_net_amount"] as const;
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

export async function getSalaryEntriesByPayrollIdForSalaryRegister({
  supabase,
  payrollId,
}: {
  supabase: TypedSupabaseClient;
  payrollId: string;
}) {
  const columns = [
    "month",
    "year",
    "present_days",
    "overtime_hours",
    "field_name",
    "type",
    "amount",
  ] as const;

  const { data, error } = await supabase
    .from("employees")
    .select(
      `id, company_id, first_name, middle_name, last_name, employee_code, salary_entries!inner(${columns.join(
        ","
      )}),employee_project_assignment!inner(position,start_date),employee_statutory_details!inner(aadhaar_number,pan_number,uan_number,pf_number,esic_number),leaves(start_date,end_date,leave_type),employee_bank_details(account_number,bank_name)`
    )
    .eq("salary_entries.payroll_id", payrollId)
    .order("type, field_name", {
      ascending: true,
      referencedTable: "salary_entries",
    })
    .returns<SalaryEntriesWithEmployee[]>();

  if (error) {
    console.error("getSalaryEntriesByPayrollId Error", error);
  }

  const filteredData = data?.map((employee) => {
    const salaryEntry = employee.salary_entries[0];
    const year = salaryEntry?.year;
    const month = salaryEntry?.month;

    const filteredLeaves = employee?.leaves?.filter((leave) => {
      const leaveDate = new Date(leave.start_date);
      return (
        leaveDate.getFullYear() === year && leaveDate.getMonth() + 1 === month
      );
    });

    return {
      ...employee,
      leaves: filteredLeaves,
    };
  });

  return { data: filteredData, error: null };
}

export async function getPayrollEntriesByPayrollIdForPayrollRegister({
  supabase,
  payrollId,
}: {
  supabase: TypedSupabaseClient;
  payrollId: string;
}) {
  const columns = ["payment_status", "amount"] as const;

  const { data, error } = await supabase
    .from("employees")
    .select(
      `id, company_id, first_name, middle_name, last_name, employee_code, payroll_entries!inner(${columns.join(
        ","
      )})`
    )
    .eq("payroll_entries.payroll_id", payrollId)
    .returns<PayrollEntriesWithEmployee[]>();

  if (error) {
    console.error("getPayrollEntriesByPayrollId Error", error);
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

  const columns = [
    "id",
    "month",
    "year",
    "present_days",
    "overtime_hours",
    "employee_id",
    "payroll_id",
    "field_name",
    "type",
    "amount",
    "is_pro_rata",
    "consider_for_epf",
    "consider_for_esic",
  ] as const;

  const { data, error } = await supabase
    .from("salary_entries")
    .select(columns.join(","))
    .eq("employee_id", employeeId)
    .eq("year", filterYear)
    .gte("month", 1)
    .lte("month", 12)
    .returns<SalaryEntriesDatabaseRow[]>();

  if (error) {
    console.error("getSalaryEntriesByEmployeeId Error", error);
  }

  return { data, error };
}
