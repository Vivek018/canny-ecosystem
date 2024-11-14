import { convertToNull } from "@canny_ecosystem/utils";
import type {
  EmployeeAddressDatabaseInsert,
  EmployeeAddressDatabaseUpdate,
  EmployeeBankDetailsDatabaseInsert,
  EmployeeBankDetailsDatabaseUpdate,
  EmployeeDatabaseInsert,
  EmployeeDatabaseUpdate,
  EmployeeGuardianDatabaseInsert,
  EmployeeGuardianDatabaseUpdate,
  EmployeeProjectAssignmentDatabaseInsert,
  EmployeeProjectAssignmentDatabaseUpdate,
  EmployeeSkillDatabaseInsert,
  EmployeeSkillDatabaseUpdate,
  EmployeeStatutoryDetailsDatabaseInsert,
  EmployeeStatutoryDetailsDatabaseUpdate,
  EmployeeWorkHistoryDatabaseInsert,
  EmployeeWorkHistoryDatabaseUpdate,
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

export async function updateEmployee({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeDatabaseUpdate;
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

  const updateData = convertToNull(data);

  const { error, status } = await supabase
    .from("employees")
    .update(updateData)
    .eq("id", data.id!)
    .select()
    .single();

  if (error) {
    console.error("error", error);
  }

  return { status, error };
}

export async function deleteEmployee({
  supabase,
  id,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  id: string;
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
    .from("employees")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
  }

  return { status, error };
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

export async function updateEmployeeStatutoryDetails({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeStatutoryDetailsDatabaseUpdate;
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

  const updateData = convertToNull(data);

  const { error, status } = await supabase
    .from("employee_statutory_details")
    .update(updateData)
    .eq("employee_id", data.employee_id!)
    .select()
    .single();

  if (error) {
    console.error("error", error);
  }

  return { status, error };
}

export async function updateEmployeeBankDetails({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeBankDetailsDatabaseUpdate;
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

  const updateData = convertToNull(data);

  const { error, status } = await supabase
    .from("employee_bank_details")
    .update(updateData)
    .eq("employee_id", data.employee_id!)
    .select()
    .single();

  if (error) {
    console.error("error", error);
  }

  return { status, error };
}

export async function updateEmployeeAddress({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeAddressDatabaseUpdate;
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

  const updateData = convertToNull(data);

  const { error, status } = await supabase
    .from("employee_addresses")
    .update(updateData)
    .eq("id", data.id!)
    .select()
    .single();

  if (error) {
    console.error("error", error);
  }

  return { status, error };
}

export async function deleteEmployeeAddress({
  supabase,
  id,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  id: string;
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
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
  }

  return { status, error };
}

export async function updateEmployeeGuardian({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeGuardianDatabaseUpdate;
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

  const updateData = convertToNull(data);

  const { error, status } = await supabase
    .from("employee_guardians")
    .update(updateData)
    .eq("id", data.id!)
    .select()
    .single();

  if (error) {
    console.error("error", error);
  }

  return { status, error };
}

export async function deleteEmployeeGuardian({
  supabase,
  id,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  id: string;
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
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
  }

  return { status, error };
}

export async function createEmployeeSkill({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeSkillDatabaseInsert;
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
    .from("employee_skills")
    .insert(data)
    .single();

  if (error) {
    console.error("employee_skills_error", error);
  }

  return { error, status };
}

export async function updateEmployeeSkill({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeSkillDatabaseUpdate;
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

  const updateData = convertToNull(data);

  const { error, status } = await supabase
    .from("employee_skills")
    .update(updateData)
    .eq("id", data.id!)
    .select()
    .single();

  if (error) {
    console.error("error", error);
  }

  return { status, error };
}

export async function deleteEmployeeSkill({
  supabase,
  id,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  id: string;
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
    .from("employee_skills")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
  }

  return { status, error };
}

export async function createEmployeeWorkHistory({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeWorkHistoryDatabaseInsert;
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
    .from("employee_work_history")
    .insert(data)
    .single();

  if (error) {
    console.error("employee_works_history_error", error);
  }

  return { error, status };
}

export async function updateEmployeeWorkHistory({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeWorkHistoryDatabaseUpdate;
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

  const updateData = convertToNull(data);

  const { error, status } = await supabase
    .from("employee_work_history")
    .update(updateData)
    .eq("id", data.id!)
    .select()
    .single();

  if (error) {
    console.error("error", error);
  }

  return { status, error };
}

export async function deleteEmployeeWorkHistory({
  supabase,
  id,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  id: string;
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
    .from("employee_work_history")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
  }

  return { status, error };
}

export async function createEmployeeProjectAssignment({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeProjectAssignmentDatabaseInsert;
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
    .from("employee_project_assignments")
    .insert(data)
    .single();

  if (error) {
    console.error("employee_project_assignments_error", error);
  }

  return { error, status };
}

export async function updateEmployeeProjectAssignment({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeProjectAssignmentDatabaseUpdate;
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

  const updateData = convertToNull(data);

  const { error, status } = await supabase
    .from("employee_project_assignments")
    .update(updateData)
    .eq("id", data.id!)
    .select()
    .single();

  if (error) {
    console.error("error", error);
  }

  return { status, error };
}

export async function deleteEmployeeProjectAssignment({
  supabase,
  id,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  id: string;
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
    .from("employee_project_assignments")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
  }

  return { status, error };
}
