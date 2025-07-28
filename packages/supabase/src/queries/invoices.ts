import { defaultYear, formatUTCDate } from "@canny_ecosystem/utils";
import type {
  InferredType,
  InvoiceDatabaseRow,
  LocationDatabaseRow,
  TypedSupabaseClient,
} from "../types";
import type { DashboardFilters } from "./exits";
import { months } from "@canny_ecosystem/utils/constant";

export type InvoiceDataType = Pick<
  InvoiceDatabaseRow,
  | "invoice_number"
  | "date"
  | "subject"
  | "company_address_id"
  | "payroll_data"
  | "type"
  | "include_charge"
  | "include_cgst"
  | "include_sgst"
  | "include_igst"
  | "is_paid"
  | "paid_date"
  | "company_id"
  | "id"
  | "include_proof"
  | "proof"
> & {
  company_locations: Pick<LocationDatabaseRow, "id" | "name">;
};

export async function getInvoiceProofUrlByPayrollIdAndDocumentName({
  supabase,
  documentName,
}: {
  supabase: TypedSupabaseClient;
  documentName: string;
}) {
  const columns = ["proof"] as const;

  const { data, error } = await supabase
    .from("invoice")
    .select(columns.join(","))
    .eq("invoice_number", documentName)
    .maybeSingle<InvoiceDatabaseRow>();

  if (error)
    console.error("getInvoiceProofUrlBypayrollIdAndDocumentName Error", error);

  return { data, error };
}

export type InvoiceFilters = {
  date_start?: string | undefined | null;
  date_end?: string | undefined | null;
  company_location?: string | undefined | null;
  type?: string | undefined | null;
  service_charge?: string | undefined | null;
  paid?: string | undefined | null;
  paid_date_start?: string | undefined | null;
  paid_date_end?: string | undefined | null;
};

export async function getInvoicesByCompanyId({
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
    filters?: InvoiceFilters | null;
  };
}) {
  const { from, to, filters, searchQuery } = params;
  const {
    date_start,
    date_end,
    company_location,
    type,
    service_charge,
    paid,
    paid_date_start,
    paid_date_end,
  } = filters ?? {};

  const columns = [
    "id",
    "subject",
    "invoice_number",
    "date",
    "company_address_id",
    "payroll_data",
    "include_charge",
    "include_cgst",
    "include_sgst",
    "include_igst",
    "proof",
    "include_proof",
    "is_paid",
    "paid_date",
    "type",
    "company_id",
    "created_at",
  ] as const;

  const query = supabase
    .from("invoice")
    .select(
      `${columns.join(",")},company_locations!${
        company_location ? "inner" : "left"
      }(id,name)`
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (searchQuery) {
    query.or(
      `invoice_number.ilike.*${searchQuery}*,subject.ilike.*${searchQuery}*`
    );
  }
  const dateFilters = [
    { field: "date", start: date_start, end: date_end },
    {
      field: "paid_date",
      start: paid_date_start,
      end: paid_date_end,
    },
  ];
  for (const { field, start, end } of dateFilters) {
    if (start) query.gte(field, formatUTCDate(start));
    if (end) query.lte(field, formatUTCDate(end));
  }

  if (company_location) {
    query.eq("company_locations.name", company_location);
  }
  if (type) {
    query.eq("type", type);
  }

  if (service_charge) {
    query.eq("include_charge", Boolean(service_charge));
  }
  if (paid) {
    query.eq("is_paid", Boolean(paid));
  }
  const { data, count, error } = await query.range(from, to);

  if (error) {
    console.error("getInvoicesByCompanyId Error", error);
  }

  return {
    data,
    meta: { count: count },
    error,
  };
}

export async function getInvoiceById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "id",
    "subject",
    "invoice_number",
    "date",
    "company_address_id",
    "payroll_data",
    "include_charge",
    "include_cgst",
    "include_sgst",
    "include_igst",
    "include_proof",
    "include_header",
    "is_paid",
    "paid_date",
    "proof",
    "type",
    "created_at",
    "company_id",
    "additional_text",
    "user_id",
  ] as const;

  const { data, error } = await supabase
    .from("invoice")
    .select(`${columns.join(",")}`)
    .eq("id", id)
    .single<InferredType<InvoiceDatabaseRow, (typeof columns)[number]>>();

  if (error) {
    console.error("getInvoiceByCompanyId Error", error);
  }

  return { data, error };
}

export async function getInvoicesByCompanyIdForDashboard({
  supabase,
  companyId,
  filters,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
  filters?: DashboardFilters | null;
}) {
  const columns = ["is_paid", "date"] as const;
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
    .from("invoice")
    .select(`${columns.join(",")}`)
    .eq("company_id", companyId)
    .gte("date", startOfYear.toISOString())
    .lt("date", endOfYear.toISOString())
    .order("date", { ascending: true })
    .returns<InferredType<InvoiceDatabaseRow, (typeof columns)[number]>[]>();

  if (error) {
    console.error("getInvoiceDataByCompanyIdForDashboard Error", error);
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
    const date = new Date(item.date ?? "");
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

export async function getPaidInvoicesAmountsByCompanyIdByMonthsForReimbursements({
  supabase,
  companyId,
  filters,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
  filters?: DashboardFilters;
}) {
  const columns = ["paid_date", "payroll_data"] as const;
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
    .from("invoice")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .eq("type", "reimbursement")
    .in("is_paid", [true])
    .gte("paid_date", startOfCurrentMonth.toISOString())
    .lt("paid_date", endOfCurrentMonth.toISOString())
    .order("created_at", { ascending: false })
    .returns<InferredType<InvoiceDatabaseRow, (typeof columns)[number]>[]>();

  if (currentMonthError)
    console.error(
      "getPaidInvoicesAmountsByCompanyIdByMonthsForReimbursements Error",
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
    .from("invoice")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .eq("type", "reimbursement")
    .in("is_paid", [true])
    .gte("paid_date", startOfPrevMonth.toISOString())
    .lt("paid_date", endOfPrevMonth.toISOString())
    .order("created_at", { ascending: false })
    .returns<InferredType<InvoiceDatabaseRow, (typeof columns)[number]>[]>();

  if (previousMonthError)
    console.error(
      "getPaidInvoicesAmountsByCompanyIdByMonthsForReimbursements Error",
      previousMonthError
    );

  return { currentMonth, currentMonthError, previousMonth, previousMonthError };
}
