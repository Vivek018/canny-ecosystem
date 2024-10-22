import { UTCDate } from "@canny_ecosystem/utils";
import type {
  EmployeeAddressDatabaseRow,
  EmployeeBankDetailsDatabaseRow,
  EmployeeDatabaseRow,
  EmployeeGuardianDatabaseRow,
  EmployeeStatutoryDetailsDatabaseRow,
  InferredType,
  TypedSupabaseClient,
} from "../types";
import { HARD_QUERY_LIMIT } from "../constant";

export type EmployeeFilters = {
  start?: string | undefined;
  end?: string | undefined;
  education?: string | undefined;
  gender?: string | undefined;
  status?: string | undefined;
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
>;

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
    .select(columns.join(","), { count: "exact" })
    .eq("company_id", companyId);

  if (sort) {
    const [column, value] = sort;
    const ascending = value === "asc";

    if (column === "employee_code") {
      query.order("employee_code", { ascending });
    } else if (column === "full_name") {
      query.order("first_name", { ascending });
    } else if (column === "mobile_number") {
      query.order("primary_mobile_number", { ascending });
    } else if (column === "date_of_birth") {
      query.order("date_of_birth", { ascending });
    } else if (column === "education") {
      query.order("education", { ascending });
    } else if (column === "gender") {
      query.order("gender", { ascending });
    } else if (column === "status") {
      query.order("status", { ascending });
    } else {
      query.order(column, { ascending });
    }
  } else {
    query.order("created_at", { ascending: false });
  }

  if (searchQuery) {
    query.textSearch("fts_vector", `'${searchQuery}'`);
  }

  if (filters) {
    const { start, end, gender, education, status } = filters;

    if (start) {
      const fromDate = new UTCDate(start);
      query.gte("date_of_birth", fromDate.toISOString());
    }
    if (end) {
      const toDate = new UTCDate(end);
      query.lte("date_of_birth", toDate?.toISOString());
    }

    if (gender) {
      query.eq("gender", gender.toLowerCase());
    }

    if (education) {
      query.eq("education", education.toLowerCase());
    }

    if (status) {
      const statusBoolean = status.toLowerCase() === "active";
      query.eq("is_active", statusBoolean);
    }
  }

  const { data, count, error } = await query
    .range(from, to)
    .returns<EmployeeDataType[]>();

  if (error) {
    console.error(error);
  }

  return {
    data,
    meta: {
      count: count ?? data?.length,
    },
    error,
  };
}

export async function getEmployeeById({
  supabase,
  id,
  companyId,
}: { supabase: TypedSupabaseClient; id: string; companyId: string }) {
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
    .eq("company_id", companyId)
    .single<InferredType<EmployeeDatabaseRow, (typeof columns)[number]>>();

  if (error) {
    console.error(error);
  }

  return { data, error };
}

export async function getEmployeeStatutoryDetailsById({
  supabase,
  id,
}: { supabase: TypedSupabaseClient; id: string }) {
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
}: { supabase: TypedSupabaseClient; id: string }) {
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
}: { supabase: TypedSupabaseClient; employeeId: string }) {
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
}: { supabase: TypedSupabaseClient; employeeId: string }) {
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
}: { supabase: TypedSupabaseClient; id: string }) {
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
}: { supabase: TypedSupabaseClient; id: string }) {
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
