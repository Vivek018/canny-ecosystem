import { formatUTCDate } from "@canny_ecosystem/utils";
import type {
  EmployeeDatabaseRow,
  IncidentsDatabaseRow,
  TypedSupabaseClient,
  InferredType,
  EmployeeProjectAssignmentDatabaseRow,
  SiteDatabaseRow,
  ProjectDatabaseRow,
  VehiclesDatabaseRow,
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
  site?: string | undefined | null;
};

export type IncidentsDatabaseType = Pick<
  IncidentsDatabaseRow,
  | "id"
  | "employee_id"
  | "vehicle_id"
  | "title"
  | "date"
  | "location_type"
  | "location"
  | "category"
  | "severity"
  | "status"
  | "description"
  | "diagnosis"
  | "action_taken"
  | "company_id"
> & {
  employees: Pick<
    EmployeeDatabaseRow,
    "id" | "first_name" | "middle_name" | "last_name" | "employee_code"
  > & {
    work_details: Pick<EmployeeProjectAssignmentDatabaseRow, "employee_id"> & {
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
  vehicles: Pick<
    VehiclesDatabaseRow,
    "id" | "registration_number" | "name" | "site_id"
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
    site,
  } = filters ?? {};

  const foreignFilters = project || site;

  const columns = [
    "id",
    "date",
    "employee_id",
    "vehicle_id",
    "title",
    "location_type",
    "location",
    "category",
    "severity",
    "status",
    "description",
    "diagnosis",
    "action_taken",
    "company_id",
  ] as const;

  const query = supabase
    .from("incidents")
    .select(
      `
        ${columns.join(",")},
        employees!left(
          id, first_name, middle_name, last_name, employee_code,
          work_details!work_details_employee_id_fkey!${foreignFilters ? "inner" : "left"}(
            sites!${foreignFilters ? "inner" : "left"}(
              id, name, projects!${project ? "inner" : "left"}(id, name)
            )
          )
        ),vehicles!left(id,name,registration_number,sites!${foreignFilters ? "inner" : "left"}(
              id, name, projects!${project ? "inner" : "left"}(id, name)
            ))
      `,
      {
        count: "exact",
      }
    )
    .eq("company_id", companyId);

  if (sort) {
    const simpleSortable = [
      "date",
      "title",
      "location_type",
      "location",
      "category",
      "severity",
      "status",
      "description",
      "diagnosis",
      "action_taken",
    ];
    const [column, direction] = sort;
    if (simpleSortable.includes(column)) {
      query.order(column, { ascending: direction === "asc" });
    } else {
      query.order("created_at", { ascending: false });
    }
  } else {
    query.order("created_at", { ascending: false });
  }

  if (searchQuery) {
    const searchQueryArray = searchQuery.split(" ");
    if (searchQueryArray.length > 0 && searchQueryArray.length <= 3) {
      for (const q of searchQueryArray) {
        query.or(
          `first_name.ilike.*${q}*,middle_name.ilike.*${q}*,last_name.ilike.*${q}*,employee_code.ilike.*${q}*`,
          { referencedTable: "employees" }
        );
      }
    } else {
      query.or(
        `first_name.ilike.*${searchQuery}*,middle_name.ilike.*${searchQuery}*,last_name.ilike.*${searchQuery}*,employee_code.ilike.*${searchQuery}*`,
        { referencedTable: "employees" }
      );
    }
  }

  const dateFilters = [{ field: "date", start: date_start, end: date_end }];
  for (const { field, start, end } of dateFilters) {
    if (start) query.gte(field, formatUTCDate(start));
    if (end) query.lte(field, formatUTCDate(end));
  }

  if (status) query.eq("status", status);
  if (location_type) query.eq("location_type", location_type);
  if (category) query.eq("category", category);
  if (severity) query.eq("severity", severity);
  if (project) {
    query.eq("employees.work_details.sites.projects.name", project);
  }
  if (site) {
    query.eq("employees.work_details.sites.name", site);
  }

  const { data, count, error } = await query.range(from, to);

  if (error) {
    console.error("getIncidentsByCompanyId Error", error);
  }

  return { data, meta: { count }, error };
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
    "vehicle_id",
    "date",
    "title",
    "location_type",
    "location",
    "category",
    "severity",
    "status",
    "description",
    "diagnosis",
    "action_taken",
    "company_id",
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
