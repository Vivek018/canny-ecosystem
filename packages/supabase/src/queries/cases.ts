import { formatUTCDate } from "@canny_ecosystem/utils";
import type {
  TypedSupabaseClient,
  InferredType,
  CasesDatabaseRow,
  ProjectDatabaseRow,
  EmployeeDatabaseRow,
} from "../types";

export type CaseFilters = {
  case_type?: string | undefined | null;
  status?: string | undefined | null;
  reported_on?: string | undefined | null;
  reported_by?: string | undefined | null;
  date_start?: string | undefined | null;
  date_end?: string | undefined | null;
  incident_date_start?: string | undefined | null;
  incident_date_end?: string | undefined | null;
  location?: string | undefined | null;
  location_type?: string | undefined | null;
  resolution_date_start?: string | undefined | null;
  resolution_date_end?: string | undefined | null;
};

export type CasesDataType = Pick<
  CasesDatabaseRow,
  | "id"
  | "title"
  | "description"
  | "case_type"
  | "status"
  | "incident_date"
  | "date"
  | "resolution_date"
  | "location"
  | "location_type"
  | "reported_by"
  | "reported_on"
  | "amount_given"
  | "amount_received"
  | "court_case_reference"
  | "document"
> & {
  reported_by_project: Pick<ProjectDatabaseRow, "id" | "name">;
  reported_by_site: Pick<ProjectDatabaseRow, "id" | "name">;
  reported_by_company: Pick<ProjectDatabaseRow, "id" | "name">;
  reported_by_employee: Pick<EmployeeDatabaseRow, "id" | "employee_code">;
  reported_on_project: Pick<ProjectDatabaseRow, "id" | "name"> & {
    projects: Pick<ProjectDatabaseRow, "id">;
  };
  reported_on_site: Pick<ProjectDatabaseRow, "id" | "name">;
  reported_on_company: Pick<ProjectDatabaseRow, "id" | "name">;
  reported_on_employee: Pick<EmployeeDatabaseRow, "id" | "employee_code">;
};
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
    date_start,
    date_end,
    incident_date_start,
    incident_date_end,
    location_type,
    resolution_date_start,
    resolution_date_end,
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
    "reported_on",
    "amount_given",
    "amount_received",
    "court_case_reference",
    "document",
  ] as const;

  const query = supabase
    .from("cases")
    .select(
      `${columns.join(",")}, reported_by_project:projects!cases_reported_by_project_id_fkey(id, name), reported_on_project:projects!cases_reported_on_project_id_fkey(id, name),
       reported_by_employee:employees!cases_reported_by_employee_id_fkey(id, employee_code), reported_on_employee:employees!cases_reported_on_employee_id_fkey(id, employee_code),
       reported_by_site:sites!cases_reported_by_site_id_fkey(id, name, projects!sites_project_id_fkey(id)), reported_on_site:sites!cases_reported_on_site_id_fkey(id, name),
       reported_by_company:companies!cases_reported_by_company_id_fkey(id, name), reported_on_company:companies!cases_reported_on_company_id_fkey(id, name)`,
      {
        count: "exact",
      },
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
          `title.ilike.*${searchQueryElement}*,description.ilike.*${searchQueryElement}*`,
        );
      }
    } else {
      query.or(
        `title.ilike.*${searchQuery}*,description.ilike.*${searchQuery}*`,
      );
    }
  }

  const dateFilters = [
    {
      field: "date",
      start: date_start,
      end: date_end,
    },
    {
      field: "incident_date",
      start: incident_date_start,
      end: incident_date_end,
    },
    {
      field: "resolution_date",
      start: resolution_date_start,
      end: resolution_date_end,
    },
  ];
  for (const { field, start, end } of dateFilters) {
    if (start) query.gte(field, formatUTCDate(start));
    if (end) query.lte(field, formatUTCDate(end));
  }
  if (case_type) {
    query.eq("case_type", case_type as CasesDatabaseRow["case_type"]);
  }
  if (status) {
    query.eq("status", status as CasesDatabaseRow["status"]);
  }
  if (location_type) {
    query.eq(
      "location_type",
      location_type as CasesDatabaseRow["location_type"],
    );
  }
  if (reported_by) {
    query.eq("reported_by", reported_by as CasesDatabaseRow["reported_by"]);
  }
  if (reported_on) {
    query.eq("reported_on", reported_on as CasesDatabaseRow["reported_on"]);
  }

  const { data, count, error } = await query.range(from, to);
  if (error) {
    console.error("getCasesByCompanyId Error", error);
  }

  return { data, meta: { count: count }, error };
}

export async function getCasesById({
  supabase,
  caseId,
}: {
  supabase: TypedSupabaseClient;
  caseId: string | undefined;
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
    "reported_on",
    "amount_given",
    "amount_received",
    "court_case_reference",
    "document",
    "reported_by_project_id",
    "reported_by_site_id",
    "reported_by_company_id",
    "reported_by_employee_id",
    "reported_on_project_id",
    "reported_on_site_id",
    "reported_on_company_id",
    "reported_on_employee_id",
  ] as const;

  const { data, error } = await supabase
    .from("cases")
    .select(`${columns.join(",")}`, {
      count: "exact",
    })
    .eq("id", caseId!)
    .single<InferredType<CasesDatabaseRow, (typeof columns)[number]>>();

  if (error) {
    console.error("getCasesById Error", error);
  }

  return { data, error };
}

export async function getCasesDocumentUrlByCompanyIdAndCaseTitle({
  supabase,
  companyId,
  caseTitle,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
  caseTitle: string;
}) {
  const columns = ["document"] as const;

  const { data, error } = await supabase
    .from("cases")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .eq("title", caseTitle)
    .maybeSingle<CasesDatabaseRow>();

  if (error)
    console.error("getCaseDocumentUrlByCompanyIdAndCaseTitle Error", error);

  return { data, error };
}
