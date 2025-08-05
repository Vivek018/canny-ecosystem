import { formatUTCDate } from "@canny_ecosystem/utils";
import type {
  EmployeeAddressDatabaseRow,
  EmployeeBankDetailsDatabaseRow,
  EmployeeDatabaseRow,
  EmployeeDocumentsDatabaseRow,
  EmployeeGuardianDatabaseRow,
  EmployeeMonthlyAttendanceDatabaseRow,
  EmployeeProjectAssignmentDatabaseInsert,
  EmployeeProjectAssignmentDatabaseRow,
  EmployeeSkillDatabaseRow,
  EmployeeStatutoryDetailsDatabaseRow,
  EmployeeWorkHistoryDatabaseRow,
  InferredType,
  ProjectDatabaseRow,
  SiteDatabaseRow,
  TypedSupabaseClient,
} from "../types";

import {
  HARD_QUERY_LIMIT,
  HARDEST_QUERY_LIMIT,
  MID_QUERY_LIMIT,
  SINGLE_QUERY_LIMIT,
} from "../constant";

export type EmployeeFilters = {
  dob_start?: string | undefined | null;
  dob_end?: string | undefined | null;
  education?: string | undefined | null;
  gender?: string | undefined | null;
  status?: string | undefined | null;
  project?: string | undefined | null;
  site?: string | undefined | null;
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
  filters?: EmployeeFilters | null;
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
    sites: {
      id: SiteDatabaseRow["id"];
      name: SiteDatabaseRow["name"];
      projects: {
        id: ProjectDatabaseRow["id"];
        name: ProjectDatabaseRow["name"];
      };
    };
  };
} & {
  employee_statutory_details: Pick<
    EmployeeStatutoryDetailsDatabaseRow,
    "aadhaar_number" | "pan_number" | "uan_number" | "pf_number" | "esic_number"
  >;
} & {
  employee_bank_details: Pick<
    EmployeeBankDetailsDatabaseRow,
    "account_number" | "bank_name"
  >;
};

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

  const {
    dob_start,
    dob_end,
    education,
    gender,
    status,
    project,
    site,
    assignment_type,
    position,
    skill_level,
    doj_start,
    doj_end,
    dol_start,
    dol_end,
  } = filters ?? {};

  const foreignFilters =
    project ||
    site ||
    assignment_type ||
    position ||
    skill_level ||
    doj_start ||
    doj_end ||
    dol_start ||
    dol_end;

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
        employee_project_assignment!employee_project_assignments_employee_id_fkey!${
          foreignFilters ? "inner" : "left"
        }(employee_id, assignment_type, skill_level, position, start_date, end_date,
        sites!${foreignFilters ? "inner" : "left"}(id, name, projects!${
          project ? "inner" : "left"
        }(id, name))
      ),
      employee_statutory_details!left(aadhaar_number, pan_number, uan_number, pf_number, esic_number),
      employee_bank_details!left(account_number, bank_name)`,
      { count: "exact" },
    )
    .eq("company_id", companyId);

  if (sort) {
    const [column, direction] = sort;
    query.order(column, { ascending: direction === "asc" });
  } else {
    query.order("created_at", { ascending: false });
  }

  if (searchQuery) {
    query.textSearch("fts_vector", `'${searchQuery}'`, { type: "plain" });
  }

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
    query.eq("employee_project_assignment.sites.projects.name", project);
  }
  if (site) {
    query.eq("employee_project_assignment.sites.name", site);
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

  const { data, count, error } = await query.range(from, to);

  if (error) {
    console.error("getEmployeesByCompanyId Error", error);
  }

  return {
    data,
    meta: { count: count },
    error,
  };
}

export async function getEmployeeIdentityBySiteId({
  supabase,
  siteId,
}: {
  supabase: TypedSupabaseClient;
  siteId: string;
}) {
  const columns = ["id", "employee_code"] as const;

  const { data, error } = await supabase
    .from("employees")
    .select(
      `${columns.join(
        ",",
      )},employee_project_assignment!employee_project_assignments_employee_id_fkey!inner(site_id)`,
    )
    .eq("employee_project_assignment.site_id", siteId)
    .limit(MID_QUERY_LIMIT)
    .returns<
      InferredType<EmployeeDatabaseRow, (typeof columns)[number]>[] | null
    >();

  if (error) {
    console.error("getEmployeesBySiteId Error", error);
  }

  return {
    data,
    error,
  };
}

export async function getEmployeesBySiteId({
  supabase,
  siteId,
}: {
  supabase: TypedSupabaseClient;
  siteId: string;
}) {
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

  const { data, error } = await supabase
    .from("employees")
    .select(
      `${columns.join(",")}, employee_project_assignment!employee_project_assignments_employee_id_fkey!inner(employee_id, assignment_type, skill_level, position, start_date, end_date,
        site_id, sites!inner(name, projects(id, name))))`,
    )
    .eq("employee_project_assignment.site_id", siteId)
    .order("created_at", { ascending: false })
    .limit(MID_QUERY_LIMIT)
    .returns<EmployeeDataType[]>();

  if (error) {
    console.error("getEmployeesBySiteId Error", error);
  }

  return {
    data,
    error,
  };
}

export async function getEmployeesByPositionAndSiteId({
  supabase,
  position,
  siteId,
}: {
  supabase: TypedSupabaseClient;
  position?: string;
  siteId: string;
}) {
  const columns = ["id", "employee_code"] as const;

  const { data, error } = await supabase
    .from("employees")
    .select(
      `${columns.join(
        ",",
      )},employee_project_assignment!employee_project_assignments_employee_id_fkey!inner(site_id)`,
    )
    .eq("employee_project_assignment.site_id", siteId)
    .eq("employee_project_assignment.position", position ?? "")
    .limit(MID_QUERY_LIMIT)
    .returns<
      InferredType<EmployeeDatabaseRow, (typeof columns)[number]>[] | null
    >();

  if (error) {
    console.error("getEmployeesByPositionAndSiteId Error", error);
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
    console.error("getEmployeeIdsByEmployeeCodes Error", error);
    return { data: [], missing: [], error };
  }

  const foundCodes = data.map((e) => e.employee_code);
  const missing = employeeCodes.filter((code) => !foundCodes.includes(code));
  if (missing) {
    console.log("Missing employee codes:", missing);
  }

  return { data, missing, error };
}

export async function getEmployeeIdsByUanNumber({
  supabase,
  uan_number,
}: {
  supabase: TypedSupabaseClient;
  uan_number: string[];
}) {
  const columns = ["uan_number", "employee_id"] as const;

  const { data, error } = await supabase
    .from("employee_statutory_details")
    .select(columns.join(","))
    .in("uan_number", uan_number)
    .returns<
      InferredType<
        EmployeeStatutoryDetailsDatabaseRow,
        (typeof columns)[number]
      >[]
    >();

  if (error) {
    console.error("getEmployeeIdsByUanNumber Error", error);
    return { data: [], missing: [], error };
  }

  const foundCodes = data.map((e) => e.uan_number);
  const missing = uan_number.filter(
    (uan_number) => !foundCodes.includes(uan_number),
  );

  return { data, missing, error };
}
export async function getEmployeeIdsByEsicNumber({
  supabase,
  esic_number,
}: {
  supabase: TypedSupabaseClient;
  esic_number: string[];
}) {
  const columns = ["esic_number", "employee_id"] as const;

  const { data, error } = await supabase
    .from("employee_statutory_details")
    .select(columns.join(","))
    .in("esic_number", esic_number)
    .returns<
      InferredType<
        EmployeeStatutoryDetailsDatabaseRow,
        (typeof columns)[number]
      >[]
    >();

  if (error) {
    console.error("getEmployeeIdsByesicNumber Error", error);
    return { data: [], missing: [], error };
  }

  const foundCodes = data.map((e) => e.esic_number);
  const missing = esic_number.filter(
    (esic_number) => !foundCodes.includes(esic_number),
  );

  return { data, missing, error };
}

export async function getEmployeeByAnyIdentifier({
  supabase,
  identifier,
}: {
  supabase: TypedSupabaseClient;
  identifier: string;
}) {
  const columns = ["id"] as const;

  const orClause = [
    `employee_code.eq.${identifier}`,
    `personal_email.eq.${identifier}`,
    `primary_mobile_number.eq.${identifier}`,
    `secondary_mobile_number.eq.${identifier}`,
  ].join(",");

  const { data, error } = await supabase
    .from("employees")
    .select(columns.join(","))
    .or(orClause)
    .single<InferredType<EmployeeDatabaseRow, (typeof columns)[number]>>();

  if (error) {
    console.error("getEmployeeByAnyIdentifier Error", error);
  }

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
    console.error("getEmployeeById Error", error);
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
    .maybeSingle<
      InferredType<
        EmployeeStatutoryDetailsDatabaseRow,
        (typeof columns)[number]
      >
    >();

  if (error) {
    console.error("getEmployeeStatutoryDetailsById Error", error);
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
    .maybeSingle<
      InferredType<EmployeeBankDetailsDatabaseRow, (typeof columns)[number]>
    >();

  if (error) {
    console.error("getEmployeeBankDetailsById Error", error);
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
      | InferredType<EmployeeAddressDatabaseRow, (typeof columns)[number]>[]
      | null
    >();

  if (error) {
    console.error("getEmployeeAddressesByEmployeeId Error", error);
  }

  return { data, error };
}

export async function getDefaultEmployeeAddressesByEmployeeId({
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
    "country",
  ] as const;

  const { data, error } = await supabase
    .from("employee_addresses")
    .select(columns.join(","))
    .eq("employee_id", employeeId)
    .eq("is_primary", true)
    .order("created_at", { ascending: false })
    .limit(SINGLE_QUERY_LIMIT)
    .single<InferredType<
      Omit<EmployeeAddressDatabaseRow, "created_at">,
      (typeof columns)[number]
    > | null>();

  if (error) {
    console.error("getDefaultEmployeeAddressesByEmployeeId Error", error);
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
      | InferredType<EmployeeGuardianDatabaseRow, (typeof columns)[number]>[]
      | null
    >();

  if (error) {
    console.error("getEmployeeGuardiansByEmployeeId Error", error);
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
    console.error("getEmployeeAddressById Error", error);
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
    console.error("getEmployeeGuardianById Error", error);
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
      InferredType<EmployeeSkillDatabaseRow, (typeof columns)[number]>[] | null
    >();

  if (error) {
    console.error("getEmployeeSkillsByEmployeeId Error", error);
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
    console.error("getEmployeeSkillById Error", error);
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
      | InferredType<EmployeeWorkHistoryDatabaseRow, (typeof columns)[number]>[]
      | null
    >();

  if (error) {
    console.error("getEmployeeWorkHistoriesByEmployeeId Error", error);
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
    console.error("getEmployeeWorkHistoryById Error", error);
  }

  return { data, error };
}

export async function getEmployeeWorkHistoryByEmployeeIdAndCompanyName({
  supabase,
  employeeId,
  companyName,
}: {
  supabase: TypedSupabaseClient;
  employeeId: string;
  companyName: string;
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
    .eq("company_name", companyName)
    .single<
      InferredType<EmployeeWorkHistoryDatabaseRow, (typeof columns)[number]>
    >();

  if (error)
    console.error(
      "getEmployeeWorkHistoryByEmployeeIdAndCompanyName Error",
      error,
    );

  return { data, error };
}

export type EmployeeProjectAssignmentDataType = Omit<
  EmployeeProjectAssignmentDatabaseRow,
  "created_at"
> & {
  sites: {
    id: string;
    name: string;
    projects: { id: string; name: string };
  };
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
    "site_id",
    "position",
    "start_date",
    "end_date",
    "assignment_type",
    "skill_level",
    "probation_period",
    "probation_end_date",
  ] as const;

  const { data, error } = await supabase
    .from("employee_project_assignment")
    .select(
      `${columns.join(",")}, sites(id, name, projects(name),company_locations!left(address_line_1,address_line_2,city,state,pincode))`,
    )

    .eq("employee_id", employeeId)
    .maybeSingle<EmployeeProjectAssignmentDataType>();

  if (error) {
    console.error("getEmployeeProjectAssignmentByEmployeeId Error", error);
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

export type EmployeeReportFilters = {
  start_month?: string | undefined | null;
  end_month?: string | undefined | null;
  start_year?: string | undefined | null;
  end_year?: string | undefined | null;
  project?: string | undefined | null;
  site?: string | undefined | null;
};

export type GetEmployeesReportByCompanyIdParams = {
  to: number;
  from: number;
  sort?: [string, "asc" | "desc"];
  searchQuery?: string;
  filters?: EmployeeReportFilters | null;
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

  const { project, site, start_year, start_month, end_year, end_month } =
    filters ?? {};
  const foreignFilters = project || site;

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
        employee_project_assignment!employee_project_assignments_employee_id_fkey!${
          foreignFilters ? "inner" : "left"
        }(employee_id, assignment_type, skill_level, position, start_date, end_date,
        sites!${foreignFilters ? "inner" : "left"}(id, name, projects!${
          project ? "inner" : "left"
        }(id, name))
      )`,
      { count: "exact" },
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
  }

  if (searchQuery) {
    const searchQueryArray = searchQuery.split(" ");
    if (searchQueryArray?.length > 0 && searchQueryArray?.length <= 3) {
      for (const searchQueryElement of searchQueryArray) {
        query.or(
          `first_name.ilike.*${searchQueryElement}*,middle_name.ilike.*${searchQueryElement}*,last_name.ilike.*${searchQueryElement}*,employee_code.ilike.*${searchQueryElement}*`,
        );
      }
    } else {
      query.or(
        `first_name.ilike.*${searchQuery}*,middle_name.ilike.*${searchQuery}*,last_name.ilike.*${searchQuery}*,employee_code.ilike.*${searchQuery}*`,
      );
    }
  }

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
    query.eq("employee_project_assignment.sites.projects.name", project);
  }
  if (site) {
    query.eq("employee_project_assignment.sites.name", site);
  }

  // Fetch Data
  const { data, count, error } = await query
    .range(from, to)
    .returns<EmployeeReportDataType[]>();

  if (error) {
    console.error("getEmployeesReportByCompanyId Error", error);
    return { data: null, error };
  }

  return {
    data,
    meta: { count: count },
    error: null,
  };
}

// employee documents
export async function getEmployeeDocumentById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = ["document_type", "url"] as const;

  const { data, error } = await supabase
    .from("employee_documents")
    .select(columns.join(","))
    .eq("id", id)
    .single<Pick<EmployeeDocumentsDatabaseRow, "document_type" | "url">>();

  if (error) console.error("getEmployeeDocumentById Error", error);

  return { data, error };
}

export async function getEmployeeDocuments({
  supabase,
  employeeId,
}: {
  supabase: TypedSupabaseClient;
  employeeId: string;
}) {
  const columns = ["document_type", "url", "id"] as const;

  const { data, error } = await supabase
    .from("employee_documents")
    .select(columns.join(","))
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false })
    .limit(HARD_QUERY_LIMIT)
    .returns<
      InferredType<EmployeeDocumentsDatabaseRow, (typeof columns)[number]>[]
    >();

  if (error) console.error("getEmployeeDocuments Error", error);

  return { data, error };
}

export async function getEmployeeDocumentUrlByEmployeeIdAndDocumentName({
  supabase,
  employeeId,
  documentType,
}: {
  supabase: TypedSupabaseClient;
  employeeId: string;
  documentType: string;
}) {
  const columns = ["url"] as const;

  const { data, error } = await supabase
    .from("employee_documents")
    .select(columns.join(","))
    .eq("employee_id", employeeId)
    .eq("document_type", documentType)
    .maybeSingle<EmployeeDocumentsDatabaseRow>();

  if (error) {
    console.error(
      "getEmployeeDocumentUrlByEmployeeIdAndDocumentName Error",
      error,
    );
    return { data, error };
  }

  return { data, error };
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

export type ImportEmployeeAttendanceDataType = Pick<
  EmployeeMonthlyAttendanceDatabaseRow,
  | "month"
  | "year"
  | "working_days"
  | "present_days"
  | "working_hours"
  | "overtime_hours"
  | "absent_days"
  | "paid_holidays"
  | "paid_leaves"
  | "casual_leaves"
> & {
  employee_code: EmployeeDatabaseRow["employee_code"];
};

export type ImportEmployeeAttendanceByPresentsDataType = {
  employee_code: string;
  present_days: number;
  month?: number;
  year?: number;
};

export async function getSiteIdByEmployeeId({
  supabase,
  employeeId,
}: {
  supabase: TypedSupabaseClient;
  employeeId: string;
}) {
  const columns = ["id"] as const;

  const { data, error } = await supabase
    .from("employees")
    .select(
      `${columns.join(",")}, employee_project_assignment!employee_project_assignments_employee_id_fkey!inner(site_id)`,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .eq("id", employeeId)
    .single<
      Pick<EmployeeDatabaseRow, "id"> & {
        employee_project_assignment: {
          site: SiteDatabaseRow["id"];
        };
      }
    >();

  if (error) {
    console.error("getSiteIdByEmployeeId Error", error);
  }

  return {
    data,
    error,
  };
}

export async function getActiveEmployeesByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const columns = ["employee_code"] as const;

  //Active Employee
  const activeQuery = supabase
    .from("employees")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .in("is_active", [true]);

  const { data: activeEmployees, error: activeEmployeeError } =
    await activeQuery;

  if (activeEmployeeError) {
    console.error("getActiveEmployeesByCompanyId Error", activeEmployeeError);
  }

  //Total Employee
  const totalQuery = supabase
    .from("employees")
    .select(columns.join(","))
    .eq("company_id", companyId);

  const { data: totalEmployees, error: totalEmployeeError } = await totalQuery;

  if (totalEmployeeError) {
    console.error("getTotalEmployeesByCompanyId Error", totalEmployeeError);
  }

  //Active Employee By Sites
  const activeQueryBySites = supabase
    .from("employees")
    .select(
      `${columns.join(
        ",",
      )},employee_project_assignment!employee_project_assignments_employee_id_fkey!left(sites!left(id, name, projects!left(id, name)))`,
    )
    .eq("company_id", companyId)
    .eq("is_active", true);

  const { data: activeEmployeesBySites, error: activeEmployeeErrorBySites } =
    await activeQueryBySites;

  if (activeEmployeeErrorBySites) {
    console.error(
      "getActiveEmployeesByCompanyId Error",
      activeEmployeeErrorBySites,
    );
  }

  return {
    activeEmployees,
    activeEmployeeError,
    totalEmployees,
    totalEmployeeError,
    activeEmployeeErrorBySites,
    activeEmployeesBySites,
  };
}

export async function getAllEmployeeTablesData({
  supabase,
}: {
  supabase: TypedSupabaseClient;
}) {
  const [
    employees,
    employeeBankDetails,
    employeeStatutoryDetails,
    employeeAddressesDetails,
    employeeGuardiansDetails,
    employeeWorkDetails,
    employeeWorkHistoryDetails,
    employeeSkillsDetails,
    projectDetails,
    siteDetails,
  ] = await Promise.all([
    supabase.from("employees").select("*").limit(HARDEST_QUERY_LIMIT),
    supabase
      .from("employee_bank_details")
      .select("*")
      .limit(HARDEST_QUERY_LIMIT),
    supabase
      .from("employee_statutory_details")
      .select("*")
      .limit(HARDEST_QUERY_LIMIT),
    supabase.from("employee_addresses").select("*").limit(HARDEST_QUERY_LIMIT),
    supabase.from("employee_guardians").select("*").limit(HARDEST_QUERY_LIMIT),
    supabase
      .from("employee_project_assignment")
      .select("*")
      .limit(HARDEST_QUERY_LIMIT),
    supabase
      .from("employee_work_history")
      .select("*")
      .limit(HARDEST_QUERY_LIMIT),
    supabase.from("employee_skills").select("*").limit(HARDEST_QUERY_LIMIT),
    supabase.from("projects").select("*").limit(HARDEST_QUERY_LIMIT),
    supabase.from("sites").select("*").limit(HARDEST_QUERY_LIMIT),
  ]);

  const error =
    employees.error ||
    employeeBankDetails.error ||
    employeeStatutoryDetails.error ||
    employeeAddressesDetails.error ||
    employeeGuardiansDetails.error ||
    employeeWorkDetails.error ||
    employeeWorkHistoryDetails.error ||
    employeeSkillsDetails.error ||
    projectDetails.error ||
    siteDetails.error;

  if (error) {
    console.error("getAllEmployeeRelatedData Error:", error);
  }

  return {
    // Make sure the names is same as table names.
    data: {
      employees: employees.data,
      employee_bank_details: employeeBankDetails.data,
      employee_statutory_details: employeeStatutoryDetails.data,
      employee_addresses: employeeAddressesDetails.data,
      employee_guardians: employeeGuardiansDetails.data,
      employee_project_assignment: employeeWorkDetails.data,
      employee_work_history: employeeWorkHistoryDetails.data,
      employee_skills: employeeSkillsDetails.data,
      projects: projectDetails.data,
      site: siteDetails.data,
    },
    error,
  };
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
    `,
    )
    .or(
      [`employee_id.in.(${employeeIds.map((id) => id).join(",")})`].join(","),
    );

  const { data: conflictingRecords, error } = await query;

  if (error) {
    console.error("Error fetching conflicts:", error);
    return { conflictingIndices: [], error };
  }

  const conflictingIndices = importedData.reduce(
    (indices: number[], record, index) => {
      const hasConflict = conflictingRecords?.some(
        (existing) => existing.employee_id === record.employee_id,
      );

      if (hasConflict) {
        indices.push(index);
      }
      return indices;
    },
    [],
  );

  return { conflictingIndices, error: null };
}
