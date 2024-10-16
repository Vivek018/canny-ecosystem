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
  bypassAuth = false,
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
  bypassAuth?: boolean;
}) {
  if (!bypassAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return { status: 400, error: "Unauthorized User" };
    }
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
        bypassAuth,
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
        bypassAuth,
      },
    );

    const { error: employeeAddressesError } = await createEmployeeAddresses({
      supabase,
      data: { employee_id: data.id, ...employeeAddressesData },
      bypassAuth,
    });

    const { error: employeeGuardiansError } = await createEmployeeGuardians({
      supabase,
      data: { employee_id: data.id, ...employeeGuardiansData },
      bypassAuth,
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
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeStatutoryDetailsDatabaseInsert;
  bypassAuth?: boolean;
}) {
  if (!bypassAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return { status: 400, error: "Unauthorized User" };
    }
  }

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
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeBankDetailsDatabaseInsert;
  bypassAuth?: boolean;
}) {
  if (!bypassAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return { status: 400, error: "Unauthorized User" };
    }
  }

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
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeAddressDatabaseInsert;
  bypassAuth?: boolean;
}) {
  if (!bypassAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return { status: 400, error: "Unauthorized User" };
    }
  }

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
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeGuardianDatabaseInsert;
  bypassAuth?: boolean;
}) {
  if (!bypassAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return { status: 400, error: "Unauthorized User" };
    }
  }

  const { error, status } = await supabase
    .from("employee_guardians")
    .insert(data)
    .single();

  if (error) {
    console.error("employee_guardians_error", error);
  }

  return { error, status };
}