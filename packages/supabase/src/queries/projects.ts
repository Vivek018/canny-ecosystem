import type {
  EmployeeDatabaseRow,
  EmployeeProjectAssignmentDatabaseInsert,
  EmployeeProjectAssignmentDatabaseRow,
  InferredType,
  ProjectDatabaseRow,
  SiteDatabaseRow,
  TypedSupabaseClient,
  DepartmentsDatabaseRow,
} from "../types";
import { HARD_QUERY_LIMIT, MID_QUERY_LIMIT } from "../constant";

export type ImportEmployeeProjectAssignmentsDataType = Pick<
  EmployeeProjectAssignmentDatabaseRow,
  | "position"
  | "assignment_type"
  | "start_date"
  | "end_date"
  | "skill_level"
  | "probation_period"
  | "probation_end_date"
> & {
  employee_code: EmployeeDatabaseRow["employee_code"];
  site: string;
};

// Projects
export type ProjectsWithCompany = ProjectDatabaseRow & {
  project_client: { id: string; name: string; logo: string };
  end_client: { id: string; name: string; logo: string };
  primary_contractor: { id: string; name: string; logo: string };
};

export async function getProjectsByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const columns = [
    "id",
    "name",
    "project_code",
    "project_type",
    "project_client:companies!project_client_id (id, name, logo)",
    "end_client:companies!end_client_id (id, name, logo)",
    "primary_contractor:companies!primary_contractor_id (id, name, logo)",
    "start_date",
    "estimated_end_date",
    "actual_end_date",
    "status",
  ] as const;

  const { data, error } = await supabase
    .from("projects")
    .select(columns.join(","))
    .or(
      `project_client_id.eq.${companyId},end_client_id.eq.${companyId},primary_contractor_id.eq.${companyId}`
    )
    .limit(HARD_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .returns<Omit<ProjectsWithCompany, "created_at" | "updated_at">[]>();

  if (error) {
    console.error("getProjectsByCompanyId Error", error);
  }

  return { data, error };
}

export async function getProjectNamesByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const { data, error } = await supabase
    .from("projects")
    .select("id, name")
    .or(
      `project_client_id.eq.${companyId},end_client_id.eq.${companyId},primary_contractor_id.eq.${companyId}`
    )
    .limit(HARD_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .returns<{ id: string; name: string }[]>();

  if (error) {
    console.error("getProjectNamesByCompanyId Error", error);
  }

  return { data, error };
}

export async function getProjectById({
  supabase,
  id,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  id: string;
  companyId: string;
}) {
  const columns = [
    "id",
    "name",
    "project_code",
    "project_type",
    "description",
    "project_client_id",
    "end_client_id",
    "primary_contractor_id",
    "project_client:companies!project_client_id (id, name)",
    "end_client:companies!end_client_id (id, name)",
    "primary_contractor:companies!primary_contractor_id (id, name)",
    "start_date",
    "estimated_end_date",
    "actual_end_date",
    "status",
    "risk_assessment",
    "quality_standards",
    "health_safety_requirements",
    "environmental_considerations",
  ] as const;

  const { data, error } = await supabase
    .from("projects")
    .select(columns.join(","))
    .eq("id", id)
    .or(
      `project_client_id.eq.${companyId},end_client_id.eq.${companyId},primary_contractor_id.eq.${companyId}`
    )
    .single<Omit<ProjectsWithCompany, "created_at" | "updated_at">>();

  if (error) {
    console.error("getProjectById Error", error);
  }

  return { data, error };
}

// Sites
export type SitesWithLocation = SiteDatabaseRow & {
  company_location: { id: string; name: string };
};

export async function getSitesByProjectId({
  supabase,
  projectId,
}: {
  supabase: TypedSupabaseClient;
  projectId: string;
}) {
  const columns = [
    "id",
    "name",
    "site_code",
    "address_line_1",
    "address_line_2",
    "city",
    "state",
    "pincode",
    "latitude",
    "longitude",
    "company_location_id",
    "is_active",
    "company_location:company_locations!company_location_id (id, name)",
    "project_id",
  ] as const;

  const { data, error } = await supabase
    .from("sites")
    .select(columns.join(","))
    .eq("project_id", projectId)
    .limit(HARD_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .returns<Omit<SitesWithLocation, "created_at" | "updated_at">[]>();

  if (error) {
    console.error("getSitesByProjectId Error", error);
  }

  return { data, error };
}

export async function getSiteNamesByProjectName({
  supabase,
  projectName,
}: {
  supabase: TypedSupabaseClient;
  projectName: string;
}) {
  const { data, error } = await supabase
    .from("sites")
    .select(
      "name, projects!inner(name, project_client_id, end_client_id, primary_contractor_id)"
    )
    .eq("projects.name", projectName)
    .limit(HARD_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .returns<{ name: string }[]>();

  if (error) {
    console.error("getSiteNamesByProjectName Error", error);
  }

  return { data, error };
}

export type SitesWithProjects = Pick<SiteDatabaseRow, "id" | "name"> & {
  projects: Pick<
    ProjectDatabaseRow,
    | "id"
    | "name"
    | "project_client_id"
    | "end_client_id"
    | "primary_contractor_id"
  >;
};

export async function getSitesByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const { data, error } = await supabase
    .from("sites").select(
      `id,name,projects!inner(
        project_client_id,
        end_client_id,
        primary_contractor_id
      )`,
      { count: "exact" }
    )
    .or(
      `project_client_id.eq.${companyId},end_client_id.eq.${companyId},primary_contractor_id.eq.${companyId}`,
      {
        foreignTable: "projects",
      }
    )
    .limit(MID_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .returns<SitesWithProjects[]>();

  if (error) {
    console.error("getSitesByCompanyId Error", error);
  }

  return { data, count: data?.length, error };
}

export async function getSiteById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "id",
    "name",
    "site_code",
    "address_line_1",
    "address_line_2",
    "city",
    "state",
    "pincode",
    "latitude",
    "longitude",
    "company_location_id",
    "is_active",
    "company_location:company_locations!company_location_id (id, name)",
    "project_id",
  ] as const;

  const { data, error } = await supabase
    .from("sites").select(columns.join(","))
    .eq("id", id)
    .single<Omit<SitesWithLocation, "created_at" | "updated_at">>();

  if (error) {
    console.error("getSiteById Error", error);
  }

  return { data, error };
}

export async function getEmployeeProjectAssignmentsConflicts({
  supabase,
  importedData,
}: {
  supabase: TypedSupabaseClient;
  importedData: EmployeeProjectAssignmentDatabaseInsert[];
}) {
  const employeeIds = [...new Set(importedData.map((emp) => emp.employee_id))];

  const query = supabase
    .from("employee_project_assignment")
    .select(
      `
      employee_id
    `
    )
    .or(
      [`employee_id.in.(${employeeIds.map((id) => id).join(",")})`].join(",")
    );

  const { data: conflictingRecords, error } = await query;

  if (error) {
    console.error("Error fetching conflicts:", error);
    return { conflictingIndices: [], error };
  }

  const conflictingIndices = importedData.reduce(
    (indices: number[], record, index) => {
      const hasConflict = conflictingRecords?.some(
        (existing) => existing.employee_id === record.employee_id
      );

      if (hasConflict) {
        indices.push(index);
      }
      return indices;
    },
    []
  );

  return { conflictingIndices, error: null };
}

export async function createEmployeeProjectAssignmentsFromImportedData({
  supabase,
  data,
  import_type,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeProjectAssignmentDatabaseInsert[];
  import_type?: string;
}) {
  if (!data || data.length === 0) {
    return { status: "No data provided", error: null };
  }

  const identifiers = data.map((entry) => ({
    employee_id: entry.employee_id,
  }));

  const { data: existingRecords, error: existingError } = await supabase
    .from("employee_project_assignment")
    .select("employee_id")
    .in(
      "employee_id",
      identifiers.map((entry) => entry.employee_id).filter(Boolean)
    );
  if (existingError) {
    console.error("Error fetching existing records:", existingError);
    return { status: "Error fetching existing records", error: existingError };
  }

  const normalize = (value: any) =>
    String(value || "")
      .trim()
      .toLowerCase();

  const existingSets = {
    ids: new Set(existingRecords?.map((e) => normalize(e.employee_id)) || []),
  };

  if (import_type === "skip") {
    const newData = data.filter((entry) => {
      const hasConflict = existingSets.ids.has(normalize(entry.employee_id));

      return !hasConflict;
    });

    if (newData.length === 0) {
      return {
        status: "No new data to insert after filtering duplicates",
        error: null,
      };
    }

    const BATCH_SIZE = 50;

    for (let i = 0; i < newData.length; i += BATCH_SIZE) {
      const batch = newData.slice(i, Math.min(i + BATCH_SIZE, newData.length));

      const { error: insertError } = await supabase
        .from("employee_project_assignment")
        .insert(batch);
      if (insertError) {
        console.error("Error inserting batch:", insertError);
      }
    }

    return {
      status: "Successfully inserted new records",
      error: null,
    };
  }

  if (import_type === "overwrite") {
    const results = await Promise.all(
      data.map(async (record) => {
        const existingRecord = existingRecords?.find(
          (existing) =>
            normalize(existing.employee_id) === normalize(record.employee_id)
        );

        if (existingRecord) {
          const { error: updateError } = await supabase
            .from("employee_project_assignment")
            .update(record)
            .eq("employee_id", existingRecord.employee_id);

          return { type: "update", error: updateError };
        }

        const { error: insertError } = await supabase
          .from("employee_project_assignment")
          .insert(record);

        return { type: "insert", error: insertError };
      })
    );

    const errors = results.filter((r) => r.error);

    if (errors.length > 0) {
      console.error("Errors during processing:", errors);
    }

    return {
      status: "Successfully processed updates and new insertions",
      error: null,
    };
  }

  return {
    status: "Invalid import_type specified",
    error: new Error("Invalid import_type"),
  };
}

export async function getSiteIdsBySiteNames({
  supabase,
  siteNames,
}: {
  supabase: TypedSupabaseClient;
  siteNames: string[];
}) {
  const columns = ["name", "id"] as const;

  const { data, error } = await supabase
    .from("sites").select(columns.join(","))
    .in("name", siteNames)
    .returns<InferredType<SiteDatabaseRow, (typeof columns)[number]>[]>();

  if (error) {
    console.error("getSiteIdsBySiteNames Error", error);
  }

  return { data, error };
}

export async function getDepartmentsBySiteId({
  supabase,
  siteId,
}: {
  supabase: TypedSupabaseClient;
  siteId: string;
}) {
  const columns = ["id", "name", "site_id", "created_at"] as const;

  const { data, error } = await supabase
    .from("departments")
    .select(columns.join(","))
    .eq("site_id", siteId)
    .returns<
      InferredType<DepartmentsDatabaseRow, (typeof columns)[number]>[]
    >();

  if (error) {
    console.error("getDepartmentsBySiteId Error", error);
  }

  return { data, error };
}

export async function getDepartmentById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = ["id", "name", "site_id"] as const;

  const { data, error } = await supabase
    .from("departments")
    .select(columns.join(","))
    .eq("id", id)
    .single<DepartmentsDatabaseRow>();

  if (error) {
    console.error("getDepartmentById Error", error);
  }

  return { data, error };
}
