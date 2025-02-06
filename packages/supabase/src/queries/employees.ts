import { formatUTCDate } from "@canny_ecosystem/utils";
import type {
  EmployeeAddressDatabaseRow,
  EmployeeBankDetailsDatabaseRow,
  EmployeeDatabaseRow,
  EmployeeGuardianDatabaseRow,
  EmployeeProjectAssignmentDatabaseRow,
  EmployeeSkillDatabaseRow,
  EmployeeStatutoryDetailsDatabaseRow,
  EmployeeWorkHistoryDatabaseRow,
  InferredType,
  ProjectDatabaseRow,
  SiteDatabaseRow,
  TypedSupabaseClient,
} from "../types";

import { HARD_QUERY_LIMIT, MID_QUERY_LIMIT } from "../constant";

export type EmployeeFilters = {
  dob_start?: string | undefined | null;
  dob_end?: string | undefined | null;
  education?: string | undefined | null;
  gender?: string | undefined | null;
  status?: string | undefined | null;
  project?: string | undefined | null;
  project_site?: string | undefined | null;
  assignment_type?: string | undefined | null;
  position?: string | undefined | null;
  skill_level?: string | undefined | null;
  doj_start?: string | undefined | null;
  doj_end?: string | undefined | null;
  dol_start?: string | undefined | null;
  dol_end?: string | undefined | null;
};

export type GetEmployeesByCompanyIdParams = {
  to: number;
  from: number;
  sort?: [string, "asc" | "desc"];
  searchQuery?: string;
  filters?: EmployeeFilters;
};

export type EmployeeDataType = Pick<
  EmployeeDatabaseRow,
  | "id"
  | "employee_code"
  | "first_name"
  | "middle_name"
  | "last_name"
  | "date_of_birth"
  | "primary_mobile_number"
  | "education"
  | "is_active"
  | "gender"
> & {
  employee_project_assignment: Pick<
    EmployeeProjectAssignmentDatabaseRow,
    | "employee_id"
    | "assignment_type"
    | "position"
    | "skill_level"
    | "start_date"
    | "end_date"
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

export async function getEmployeesCountByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const { count, error } = await supabase
    .from("employees")
    .select("", { count: "exact", head: true })
    .eq("company_id", companyId);

  if (error) {
    console.error(error);
  }

  return { count, error };
}

export async function getEmployeesByCompanyId({
  supabase,
  companyId,
  params,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
  params: GetEmployeesByCompanyIdParams;
}) {
  const { sort, from, to, filters, searchQuery } = params;

  const hasProjectAssignmentFilter = Object.values({
    project: filters?.project,
    project_site: filters?.project_site,
    assignment_type: filters?.assignment_type,
    position: filters?.position,
    skill_level: filters?.skill_level,
    doj_start: filters?.doj_start,
    doj_end: filters?.doj_end,
    dol_start: filters?.dol_start,
    dol_end: filters?.dol_end,
  }).some((value) => value);

  const columns = [
    "id",
    "employee_code",
    "first_name",
    "middle_name",
    "last_name",
    "date_of_birth",
    "education",
    "primary_mobile_number",
    "is_active",
    "gender",
  ] as const;

  const query = supabase
    .from("employees")
    .select(
      `${columns.join(",")},
        employee_project_assignment!employee_project_assignments_employee_id_fkey!${hasProjectAssignmentFilter ? 'inner' : 'left'}(
        employee_id, assignment_type, skill_level, position, start_date, end_date,
        project_sites!${hasProjectAssignmentFilter ? 'inner' : 'left'}(id, name, projects!${hasProjectAssignmentFilter ? 'inner' : 'left'}(id, name))
      )`,
      { count: "exact" }
    )
    .eq("company_id", companyId);

  // Sorting
  if (sort) {
    const [column, direction] = sort;
    query.order(column, { ascending: direction === "asc" });
  } else {
    query.order("created_at", { ascending: false });
  }

  // Full-text search
  if (searchQuery) {
    query.textSearch("fts_vector", `'${searchQuery}'`, { type: "plain" });
  }

  // Filters
  if (filters) {
    const {
      dob_start,
      dob_end,
      education,
      gender,
      status,
      project,
      project_site,
      assignment_type,
      position,
      skill_level,
      doj_start,
      doj_end,
      dol_start,
      dol_end,
    } = filters;

    const dateFilters = [
      { field: "date_of_birth", start: dob_start, end: dob_end },
      {
        field: "employee_project_assignment.start_date",
        start: doj_start,
        end: doj_end,
      },
      {
        field: "employee_project_assignment.end_date",
        start: dol_start,
        end: dol_end,
      },
    ];

    for (const { field, start, end } of dateFilters) {
      if (start) query.gte(field, formatUTCDate(start));
      if (end) query.lte(field, formatUTCDate(end));
    }

    if (status) {
      query.eq("is_active", status === "active");
    }
    if (gender) {
      query.eq("gender", gender.toLowerCase());
    }
    if (education) {
      query.eq("education", education.toLowerCase());
    }
    if (project) {
      query.eq(
        "employee_project_assignment.project_sites.projects.name",
        project
      );
    }
    if (project_site) {
      query.eq("employee_project_assignment.project_sites.name", project_site);
    }
    if (assignment_type) {
      query.eq("employee_project_assignment.assignment_type", assignment_type);
    }
    if (position) {
      query.eq("employee_project_assignment.position", position);
    }
    if (skill_level) {
      query.eq("employee_project_assignment.skill_level", skill_level);
    }
  }

  // Fetch Data
  const { data, count, error } = await query.range(from, to);

  if (error) {
    console.error("Error fetching employees:", error);
    return { data: null, error };
  }

  return {
    data,
    meta: { count: count ?? data?.length },
    error: null,
  };
}

export async function getEmployeesByPositionAndProjectSiteId({
  supabase,
  position,
  projectSiteId,
}: {
  supabase: TypedSupabaseClient;
  position?: string;
  projectSiteId: string;
}) {
  const columns = ["id", "employee_code"] as const;

  const { data, error } = await supabase
    .from("employees")
    .select(
      `${columns.join(
        ","
      )},employee_project_assignment!employee_project_assignment_employee_id_fkey!inner(*)`
    )
    .eq("employee_project_assignment.is_current", true)
    .eq("employee_project_assignment.project_site_id", projectSiteId)
    .eq("employee_project_assignment.position", position ?? "")
    .limit(MID_QUERY_LIMIT)
    .returns<InferredType<EmployeeDatabaseRow, (typeof columns)[number]>[]>();

  if (error) {
    console.error(error);
  }

  return {
    data,
    error,
  };
}
export async function getEmployeeIdsByEmployeeCodes({
  supabase,
  employeeCodes,
}: {
  supabase: TypedSupabaseClient;
  employeeCodes: string[];
}) {
  const columns = ["employee_code", "id"] as const;

  const { data, error } = await supabase
    .from("employees")
    .select(columns.join(","))
    .in("employee_code", employeeCodes)
    .returns<InferredType<EmployeeDatabaseRow, (typeof columns)[number]>[]>();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

export async function getEmployeeIdsByProjectSiteId({
  supabase,
  projectSiteId,
}: {
  supabase: TypedSupabaseClient;
  projectSiteId: string;
}) {
  const columns = ["employee_id"] as const;

  const { data, error } = await supabase
    .from("employee_project_assignment")
    .select(`${columns.join(",")}`)
    .eq("project_site_id", projectSiteId)
    .limit(MID_QUERY_LIMIT)
    .returns<
      InferredType<
        EmployeeProjectAssignmentDatabaseRow,
        (typeof columns)[number]
      >[]
    >();

  if (error) console.error(error);

  return { data, error };
}

export async function getEmployeeById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "id",
    "employee_code",
    "first_name",
    "middle_name",
    "last_name",
    "photo",
    "date_of_birth",
    "gender",
    "education",
    "marital_status",
    "primary_mobile_number",
    "secondary_mobile_number",
    "personal_email",
    "is_active",
    "company_id",
  ] as const;

  const { data, error } = await supabase
    .from("employees")
    .select(columns.join(","))
    .eq("id", id)
    .single<InferredType<EmployeeDatabaseRow, (typeof columns)[number]>>();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

export async function getEmployeeStatutoryDetailsById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "aadhaar_number",
    "pan_number",
    "uan_number",
    "pf_number",
    "esic_number",
    "driving_license_number",
    "driving_license_expiry",
    "passport_number",
    "passport_expiry",
    "employee_id",
  ] as const;

  const { data, error } = await supabase
    .from("employee_statutory_details")
    .select(columns.join(","))
    .eq("employee_id", id)
    .single<
      InferredType<
        EmployeeStatutoryDetailsDatabaseRow,
        (typeof columns)[number]
      >
    >();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

export async function getEmployeeBankDetailsById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "account_holder_name",
    "bank_name",
    "account_number",
    "ifsc_code",
    "branch_name",
    "account_type",
    "employee_id",
  ] as const;

  const { data, error } = await supabase
    .from("employee_bank_details")
    .select(columns.join(","))
    .eq("employee_id", id)
    .single<
      InferredType<EmployeeBankDetailsDatabaseRow, (typeof columns)[number]>
    >();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

export async function getEmployeeAddressesByEmployeeId({
  supabase,
  employeeId,
}: {
  supabase: TypedSupabaseClient;
  employeeId: string;
}) {
  const columns = [
    "id",
    "address_type",
    "address_line_1",
    "address_line_2",
    "city",
    "state",
    "pincode",
    "is_primary",
    "latitude",
    "longitude",
    "employee_id",
  ] as const;

  const { data, error } = await supabase
    .from("employee_addresses")
    .select(columns.join(","))
    .eq("employee_id", employeeId)
    .limit(HARD_QUERY_LIMIT)
    .returns<
      InferredType<EmployeeAddressDatabaseRow, (typeof columns)[number]>[]
    >();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

export async function getEmployeeGuardiansByEmployeeId({
  supabase,
  employeeId,
}: {
  supabase: TypedSupabaseClient;
  employeeId: string;
}) {
  const columns = [
    "id",
    "relationship",
    "first_name",
    "last_name",
    "date_of_birth",
    "gender",
    "mobile_number",
    "alternate_mobile_number",
    "email",
    "is_emergency_contact",
    "address_same_as_employee",
    "employee_id",
  ] as const;

  const { data, error } = await supabase
    .from("employee_guardians")
    .select(columns.join(","))
    .eq("employee_id", employeeId)
    .limit(HARD_QUERY_LIMIT)
    .returns<
      InferredType<EmployeeGuardianDatabaseRow, (typeof columns)[number]>[]
    >();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

export async function getEmployeeAddressById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "id",
    "address_type",
    "address_line_1",
    "address_line_2",
    "city",
    "state",
    "pincode",
    "is_primary",
    "latitude",
    "longitude",
    "employee_id",
  ] as const;

  const { data, error } = await supabase
    .from("employee_addresses")
    .select(columns.join(","))
    .eq("id", id)
    .single<
      InferredType<EmployeeAddressDatabaseRow, (typeof columns)[number]>
    >();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

export async function getEmployeeGuardianById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "id",
    "relationship",
    "first_name",
    "last_name",
    "date_of_birth",
    "gender",
    "mobile_number",
    "alternate_mobile_number",
    "email",
    "is_emergency_contact",
    "address_same_as_employee",
    "employee_id",
  ] as const;

  const { data, error } = await supabase
    .from("employee_guardians")
    .select(columns.join(","))
    .eq("id", id)
    .single<
      InferredType<EmployeeGuardianDatabaseRow, (typeof columns)[number]>
    >();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

export async function getEmployeeSkillsByEmployeeId({
  supabase,
  employeeId,
}: {
  supabase: TypedSupabaseClient;
  employeeId: string;
}) {
  const columns = [
    "id",
    "skill_name",
    "proficiency",
    "years_of_experience",
    "employee_id",
  ] as const;

  const { data, error } = await supabase
    .from("employee_skills")
    .select(columns.join(","))
    .eq("employee_id", employeeId)
    .limit(HARD_QUERY_LIMIT)
    .returns<
      InferredType<EmployeeSkillDatabaseRow, (typeof columns)[number]>[]
    >();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

export async function getEmployeeSkillById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "id",
    "skill_name",
    "proficiency",
    "years_of_experience",
    "employee_id",
  ] as const;

  const { data, error } = await supabase
    .from("employee_skills")
    .select(columns.join(","))
    .eq("id", id)
    .single<InferredType<EmployeeSkillDatabaseRow, (typeof columns)[number]>>();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

export async function getEmployeeWorkHistoriesByEmployeeId({
  supabase,
  employeeId,
}: {
  supabase: TypedSupabaseClient;
  employeeId: string;
}) {
  const columns = [
    "id",
    "company_name",
    "position",
    "responsibilities",
    "start_date",
    "end_date",
    "employee_id",
  ] as const;

  const { data, error } = await supabase
    .from("employee_work_history")
    .select(columns.join(","))
    .eq("employee_id", employeeId)
    .limit(HARD_QUERY_LIMIT)
    .returns<
      InferredType<EmployeeWorkHistoryDatabaseRow, (typeof columns)[number]>[]
    >();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

export async function getEmployeeWorkHistoryById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "id",
    "company_name",
    "position",
    "responsibilities",
    "start_date",
    "end_date",
    "employee_id",
  ] as const;

  const { data, error } = await supabase
    .from("employee_work_history")
    .select(columns.join(","))
    .eq("id", id)
    .single<
      InferredType<EmployeeWorkHistoryDatabaseRow, (typeof columns)[number]>
    >();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

export type EmployeeProjectAssignmentDataType = Omit<
  EmployeeProjectAssignmentDatabaseRow,
  "created_at" | "updated_at"
> & {
  project_sites: { id: string; name: string; projects: { name: string } };
  supervisor: { id: string; employee_code: string };
};

export async function getEmployeeProjectAssignmentByEmployeeId({
  supabase,
  employeeId,
}: {
  supabase: TypedSupabaseClient;
  employeeId: string;
}) {
  const columns = [
    "employee_id",
    "project_site_id",
    "position",
    "start_date",
    "end_date",
    "supervisor_id",
    "assignment_type",
    "skill_level",
    "probation_period",
    "probation_end_date",
  ] as const;

  const { data, error } = await supabase
    .from("employee_project_assignment")
    .select(
      `${columns.join(
        ","
      )}, project_sites(id, name, projects(name)), supervisor:employees!employee_project_assignments_supervisor_id_fkey(id, employee_code)`
    )
    .eq("employee_id", employeeId)
    .single<EmployeeProjectAssignmentDataType>();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

export type EmployeeReportDataType = Pick<
  EmployeeDatabaseRow,
  "id" | "employee_code" | "first_name" | "middle_name" | "last_name"
> & {
  employee_project_assignment: Pick<
    EmployeeProjectAssignmentDatabaseRow,
    "employee_id" | "position" | "skill_level" | "start_date" | "end_date"
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

export type EmployeeReportFilters = {
  start_month?: string | undefined | null;
  end_month?: string | undefined | null;
  start_year?: string | undefined | null;
  end_year?: string | undefined | null;
  project?: string | undefined | null;
  project_site?: string | undefined | null;
};

export type GetEmployeesReportByCompanyIdParams = {
  to: number;
  from: number;
  sort?: [string, "asc" | "desc"];
  searchQuery?: string;
  filters?: EmployeeReportFilters;
};

export async function getEmployeesReportByCompanyId({
  supabase,
  companyId,
  params,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
  params: GetEmployeesReportByCompanyIdParams;
}) {
  const { sort, from, to, filters, searchQuery } = params;

  const columns = [
    "id",
    "employee_code",
    "first_name",
    "middle_name",
    "last_name",
  ] as const;

  const query = supabase
    .from("employees")
    .select(
      `${columns.join(",")},
        employee_project_assignment!employee_project_assignments_employee_id_fkey!inner(
        employee_id, assignment_type, skill_level, position, start_date, end_date,
        project_sites!inner(id, name, projects!inner(id, name))
      )`,
      { count: "exact" }
    )
    .eq("company_id", companyId);

  // Sorting
  if (sort) {
    const [column, direction] = sort;
    if (column === "employee_name") {
      query.order("first_name", { ascending: direction === "asc" });
    } else {
      query.order(column, { ascending: direction === "asc" });
    }
  } else {
    query.order("created_at", { ascending: false });
  }

  if (searchQuery) {
    const searchQueryArray = searchQuery.split(" ");
    if (searchQueryArray?.length > 0 && searchQueryArray?.length <= 3) {
      for (const searchQueryElement of searchQueryArray) {
        query.or(
          `first_name.ilike.*${searchQueryElement}*,middle_name.ilike.*${searchQueryElement}*,last_name.ilike.*${searchQueryElement}*,employee_code.ilike.*${searchQueryElement}*`
        );
      }
    } else {
      query.or(
        `first_name.ilike.*${searchQuery}*,middle_name.ilike.*${searchQuery}*,last_name.ilike.*${searchQuery}*,employee_code.ilike.*${searchQuery}*`
      );
    }
  }

  // Filters
  if (filters) {
    const {
      project,
      project_site,
      start_year,
      start_month,
      end_year,
      end_month,
    } = filters;

    if (start_year || end_year) {
      let endDateLastDay = 30;

      if (end_year) {
        const year = Number.parseInt(end_year, 10);
        const month = new Date(`${end_month} 1, ${end_year}`).getMonth();

        endDateLastDay = new Date(year, month + 1, 0).getDate();
      }

      const start_date = new Date(`${start_month} 1, ${start_year}`);
      const end_date = new Date(`${end_month} ${endDateLastDay}, ${end_year}`);

      if (start_year)
        query.gte(
          "employee_project_assignment.start_date",
          formatUTCDate(start_date.toISOString().split("T")[0]),
        );
      if (end_year)
        query.lte(
          "employee_project_assignment.end_date",
          formatUTCDate(end_date.toISOString().split("T")[0]),
        );
    }

    if (project) {
      query.eq(
        "employee_project_assignment.project_sites.projects.name",
        project
      );
    }
    if (project_site) {
      query.eq("employee_project_assignment.project_sites.name", project_site);
    }
  }

  // Fetch Data
  const { data, count, error } = await query
    .range(from, to)
    .returns<
      EmployeeReportDataType[]
    >();

  if (error) {
    console.error("Error fetching employees:", error);
    return { data: null, error };
  }

  return {
    data,
    meta: { count: count ?? data?.length },
    error: null,
  };
}

export type ImportEmployeeDetailsDataType = Pick<
  EmployeeDatabaseRow,
  | "employee_code"
  | "first_name"
  | "middle_name"
  | "last_name"
  | "gender"
  | "education"
  | "marital_status"
  | "is_active"
  | "date_of_birth"
  | "personal_email"
  | "primary_mobile_number"
  | "secondary_mobile_number"
>;

export type ImportEmployeeStatutoryDataType = Pick<
  EmployeeStatutoryDetailsDatabaseRow,
  | "aadhaar_number"
  | "pan_number"
  | "uan_number"
  | "pf_number"
  | "esic_number"
  | "driving_license_number"
  | "driving_license_expiry"
  | "passport_number"
  | "passport_expiry"
> & {
  employee_code: EmployeeDatabaseRow["employee_code"];
};

export type ImportEmployeeBankDetailsDataType = Pick<
  EmployeeBankDetailsDatabaseRow,
  | "account_holder_name"
  | "account_number"
  | "ifsc_code"
  | "account_type"
  | "bank_name"
  | "branch_name"
> & {
  employee_code: EmployeeDatabaseRow["employee_code"];
};

export type ImportEmployeeAddressDataType = Pick<
  EmployeeAddressDatabaseRow,
  | "address_type"
  | "address_line_1"
  | "address_line_2"
  | "city"
  | "pincode"
  | "state"
  | "country"
  | "latitude"
  | "longitude"
  | "is_primary"
> & {
  employee_code: EmployeeDatabaseRow["employee_code"];
};

export type ImportEmployeeGuardiansDataType = Pick<
  EmployeeGuardianDatabaseRow,
  | "relationship"
  | "first_name"
  | "last_name"
  | "date_of_birth"
  | "gender"
  | "mobile_number"
  | "alternate_mobile_number"
  | "email"
  | "is_emergency_contact"
  | "address_same_as_employee"
> & {
  employee_code: EmployeeDatabaseRow["employee_code"];
};
