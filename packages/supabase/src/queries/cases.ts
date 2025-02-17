import { formatUTCDate } from "@canny_ecosystem/utils";
import type {
  TypedSupabaseClient,
  InferredType,
  CasesDatabaseRow,
} from "../types";

export type CaseFilters = {
  case_type?: string | undefined | null;
  status?: string | undefined | null;
  reported_on?: string | undefined | null;
  reported_by?: string | undefined | null;
  date?: string | undefined | null;
  incident_date?: string | undefined | null;
  location?: string | undefined | null;
  location_type?: string | undefined | null;
  resolution_date?: string | undefined | null;
};

// export type AccidentsDatabaseType = Pick<
//   AccidentsDatabaseRow,
//   | "id"
//   | "title"
//   | "date"
//   | "location_type"
//   | "location"
//   | "category"
//   | "severity"
//   | "status"
//   | "description"
//   | "medical_diagnosis"
// > & {
//   employees: {
//     id: EmployeeDatabaseRow["id"];
//     company_id: EmployeeDatabaseRow["company_id"];
//     employee_code: EmployeeDatabaseRow["employee_code"];
//     first_name: EmployeeDatabaseRow["first_name"];
//     middle_name: EmployeeDatabaseRow["middle_name"];
//     last_name: EmployeeDatabaseRow["last_name"];
//   };
// };

export async function getCasesByCompanyId({
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
    filters?: CaseFilters | null;
  };
}) {
  const { from, to, sort, filters, searchQuery } = params;

  const {
    case_type,
    status,
    reported_on,
    reported_by,
    date,
    incident_date,
    location,
    location_type,
    resolution_date,
  } = filters ?? {};

  const columns = [
    "id",
    "title",
    "description",
    "case_type",
    "status",
    "incident_date",
    "date",
    "resolution_date",
    "location",
    "location_type",
    "reported_by",
    "reported_by_id",
    "reported_on",
    "reported_on_id",
    "amount_given",
    "amount_received",
    "court_case_reference",
    "document",
  ] as const;

  const query = supabase
    .from("cases")
    .select(columns.join(","), {
      count: "exact",
    })
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
          `title.ilike.*${searchQueryElement}*,description.ilike.*${searchQueryElement}*`,
        );
      }
    } else {
      query.or(
        `title.ilike.*${searchQuery}*,description.ilike.*${searchQuery}*`,
      );
    }
  }

  // const dateFilters = [
  //   {
  //     field: "date",
  //     start: date_start,
  //     end: date_end,
  //   },
  // ];
  // for (const { field, start, end } of dateFilters) {
  //   if (start) query.gte(field, formatUTCDate(start));
  //   if (end) query.lte(field, formatUTCDate(end));
  // }
  // if (status) {
  //   query.eq("status", status);
  // }
  // if (location_type) {
  //   query.eq("location_type", location_type);
  // }
  // if (category) {
  //   query.eq("category", category);
  // }
  // if (severity) {
  //   query.eq("severity", severity);
  // }

  const { data, count, error } = await query.range(from, to);
  if (error) {
    console.error("getCasesByCompanyId Error", error);
  }

  return { data, meta: { count: count ?? data?.length }, error };
}

export async function getCasesById({
  supabase,
  caseId,
}: {
  supabase: TypedSupabaseClient;
  caseId: string;
}) {
  const columns = [
    "id",
    "title",
    "description",
    "case_type",
    "status",
    "incident_date",
    "date",
    "resolution_date",
    "location",
    "location_type",
    "reported_by",
    "reported_by_id",
    "reported_on",
    "reported_on_id",
    "amount_given",
    "amount_received",
    "court_case_reference",
    "document",
  ] as const;

  const { data, error } = await supabase
    .from("cases")
    .select(columns.join(","), {
      count: "exact",
    })
    .eq("id", caseId)
    .single<InferredType<CasesDatabaseRow, (typeof columns)[number]>>();

  if (error) {
    console.error("getCasesById Error", error);
  }

  return { data, error };
}
