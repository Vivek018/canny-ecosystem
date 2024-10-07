import type {
  EmployeeAddressDatabaseInsert,
  EmployeeBankDetailsDatabaseInsert,
  EmployeeDatabaseInsert,
  EmployeeGuardianDatabaseInsert,
  EmployeeStatutoryDetailsDatabaseInsert,
  TypedSupabaseClient,
} from "../types";

export async function createEmployee({
  supabase,
  employeeData,
  employeeStatutoryDetailsData,
  employeeBankDetailsData,
  employeeAddressesData,
  employeeGuardiansData,
}: {
  supabase: TypedSupabaseClient;
  employeeData: EmployeeDatabaseInsert;
  employeeStatutoryDetailsData: Omit<
    EmployeeStatutoryDetailsDatabaseInsert,
    "employee_id"
  >;
  employeeBankDetailsData: Omit<
    EmployeeBankDetailsDatabaseInsert,
    "employee_id"
  >;
  employeeAddressesData: Omit<EmployeeAddressDatabaseInsert, "employee_id">;
  employeeGuardiansData: Omit<EmployeeGuardianDatabaseInsert, "employee_id">;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { status: 400, error: "Unauthorized User" };
  }

  const { error, status, data } = await supabase
    .from("employees")
    .insert(employeeData)
    .select("id")
    .single();

  if (error) {
    console.error("employee ", error);
    return {
      status,
      employeeError: error,
      employeeStatutoryDetailsError: null,
      employeeBankDetailsError: null,
      employeeAddressesError: null,
      employeeGuardiansError: null,
    };
  }

  if (data?.id) {
    const { error: employeeStatutoryDetailsError, status } =
      await createEmployeeStatutoryDetails({
        supabase,
        data: { employee_id: data.id, ...employeeStatutoryDetailsData },
      });

    if (employeeStatutoryDetailsError) {
      return {
        status,
        employeeError: null,
        employeeStatutoryDetailsError,
        employeeBankDetailsError: null,
        employeeAddressesError: null,
        employeeGuardiansError: null,
      };
    }

    const { error: employeeBankDetailsError } = await createEmployeeBankDetails(
      {
        supabase,
        data: { employee_id: data.id, ...employeeBankDetailsData },
      },
    );

    const { error: employeeAddressesError } = await createEmployeeAddresses({
      supabase,
      data: { employee_id: data.id, ...employeeAddressesData },
    });

    const { error: employeeGuardiansError } = await createEmployeeGuardians({
      supabase,
      data: { employee_id: data.id, ...employeeGuardiansData },
    });

    return {
      status,
      employeeError: null,
      employeeStatutoryDetailsError,
      employeeBankDetailsError,
      employeeAddressesError,
      employeeGuardiansError,
    };
  }

  return {
    status,
    employeeError: null,
    employeeStatutoryDetailsError: null,
    employeeBankDetailsError: null,
    employeeAddressesError: null,
    employeeGuardiansError: null,
  };
}

export async function createEmployeeStatutoryDetails({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeStatutoryDetailsDatabaseInsert;
}) {
  const { error, status } = await supabase
    .from("employee_statutory_details")
    .insert(data)
    .single();

  if (error) {
    console.error("employee_statutory_details_error", error);
  }

  return { error, status };
}

export async function createEmployeeBankDetails({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeBankDetailsDatabaseInsert;
}) {
  const { error, status } = await supabase
    .from("employee_bank_details")
    .insert(data)
    .single();

  if (error) {
    console.error("employee_bank_details_error", error);
  }

  return { error, status };
}

export async function createEmployeeAddresses({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeAddressDatabaseInsert;
}) {
  const { error, status } = await supabase
    .from("employee_addresses")
    .insert(data)
    .single();

  if (error) {
    console.error("employee_addresses_error", error);
  }

  return { error, status };
}

export async function createEmployeeGuardians({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeGuardianDatabaseInsert;
}) {
  const { error, status } = await supabase
    .from("employee_guardians")
    .insert(data)
    .single();

  if (error) {
    console.error("employee_guardians_error", error);
  }

  return { error, status };
}
