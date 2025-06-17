import { formatUTCDate } from "@canny_ecosystem/utils";
import type {
  EmployeeDatabaseRow,
  IncidentsDatabaseRow,
  TypedSupabaseClient,
  InferredType,
  EmployeeProjectAssignmentDatabaseRow,
  SiteDatabaseRow,
  ProjectDatabaseRow,
} from "../types";

export type IncidentFilters = {
  date_start?: string | undefined | null;
  date_end?: string | undefined | null;
  status?: IncidentsDatabaseRow["status"];
  location_type?: IncidentsDatabaseRow["location_type"];
  category?: IncidentsDatabaseRow["category"];
  severity?: IncidentsDatabaseRow["severity"];
  name?: string | undefined | null;
  project?: string | undefined | null;
  project_site?: string | undefined | null;
};

export type IncidentsDatabaseType = Pick<
  IncidentsDatabaseRow,
  | "id"
  | "title"
  | "date"
  | "location_type"
  | "location"
  | "category"
  | "severity"
  | "status"
  | "description"
  | "medical_diagnosis"
  | "action_taken"
> & {
  employees: Pick<
    EmployeeDatabaseRow,
    | "id"
    | "first_name"
    | "middle_name"
    | "last_name"
    | "employee_code"
    | "company_id"
  > & {
    employee_project_assignment: Pick<
      EmployeeProjectAssignmentDatabaseRow,
      "employee_id"
    > & {
      project_sites: {
        id: SiteDatabaseRow["id"];
        name: SiteDatabaseRow["name"];
        projects: {
          id: ProjectDatabaseRow["id"];
          name: ProjectDatabaseRow["name"];
        };
      };
    };
  };
};

export async function getIncidentsByCompanyId({
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
    filters?: IncidentFilters | null;
  };
}) {
  const { from, to, sort, searchQuery, filters } = params;

  const {
    date_start,
    date_end,
    status,
    location_type,
    category,
    severity,
    project,
    project_site,
  } = filters ?? {};

  const columns = [
    "id",
    "date",
    "title",
    "location_type",
    "location",
    "category",
    "severity",
    "status",
    "description",
    "medical_diagnosis",
    "action_taken",
  ] as const;

  const query = supabase
    .from("incidents")
    .select(
      `${columns.join(
        ","
      )},employees!inner(id,company_id,first_name, middle_name, last_name, employee_code, employee_project_assignment!employee_project_assignments_employee_id_fkey!${
        project ? "inner" : "left"
      }(project_sites!${project ? "inner" : "left"}(id, name, projects!${
        project ? "inner" : "left"
      }(id, name))))`,
      {
        count: "exact",
      }
    )
    .eq("employees.company_id", companyId);

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
      }
    } else {
      query.or(
        `first_name.ilike.*${searchQuery}*,middle_name.ilike.*${searchQuery}*,last_name.ilike.*${searchQuery}*,employee_code.ilike.*${searchQuery}*`,
        {
          referencedTable: "employees",
        }
      );
    }
  }

  const dateFilters = [
    {
      field: "date",
      start: date_start,
      end: date_end,
    },
  ];
  for (const { field, start, end } of dateFilters) {
    if (start) query.gte(field, formatUTCDate(start));
    if (end) query.lte(field, formatUTCDate(end));
  }
  if (status) {
    query.eq("status", status);
  }
  if (location_type) {
    query.eq("location_type", location_type);
  }
  if (category) {
    query.eq("category", category);
  }
  if (severity) {
    query.eq("severity", severity);
  }
  if (project) {
    query.eq(
      "employees.employee_project_assignment.project_sites.projects.name",
      project
    );
  }
  if (project_site) {
    query.eq(
      "employees.employee_project_assignment.project_sites.name",
      project_site
    );
  }

  const { data, count, error } = await query.range(from, to);
  if (error) {
    console.error("getIncidentsByCompanyId Error", error);
  }
  return { data, meta: { count: count }, error };
}

export async function getIncidentsById({
  supabase,
  incidentId,
}: {
  supabase: TypedSupabaseClient;
  incidentId: string;
}) {
  const columns = [
    "id",
    "employee_id",
    "date",
    "title",
    "location_type",
    "location",
    "category",
    "severity",
    "status",
    "description",
    "medical_diagnosis",
    "action_taken",
  ] as const;

  const { data, error } = await supabase
    .from("incidents")
    .select(`${columns.join(",")}`, {
      count: "exact",
    })
    .eq("id", incidentId)
    .single<InferredType<IncidentsDatabaseRow, (typeof columns)[number]>>();

  if (error) {
    console.error("getIncidentsById Error", error);
  }

  return { data, error };
}
