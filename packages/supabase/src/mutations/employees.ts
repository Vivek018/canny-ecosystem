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
import {
  getAllEmployeeNonDuplicatingDetailsFromGuardians,
  getAllEmployeeNonDuplicatingDetailsFromPersonals,
  getAllEmployeeNonDuplicatingDetailsFromStatutory,
} from "../queries";

export async function createEmployee({
  supabase,
  employeeData,
  employeeStatutoryDetailsData,
  employeeBankDetailsData,
  employeeProjectAssignmentData,
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
  employeeProjectAssignmentData: Omit<
    EmployeeProjectAssignmentDatabaseInsert,
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
      data,
      status,
      employeeError: error,
      employeeStatutoryDetailsError: null,
      employeeBankDetailsError: null,
      employeeProjectAssignmentError: null,
      employeeAddressesError: null,
      employeeGuardiansError: null,
    };
  }

  if (data?.id) {
    const { error: employeeStatutoryDetailsError, status } =
      await createEmployeeStatutoryDetails({
        supabase,
        data: { ...employeeStatutoryDetailsData, employee_id: data.id },
        bypassAuth,
      });

    const { error: employeeBankDetailsError } = await createEmployeeBankDetails(
      {
        supabase,
        data: { ...employeeBankDetailsData, employee_id: data.id },
        bypassAuth,
      }
    );

    const { error: employeeProjectAssignmentError } =
      await createEmployeeProjectAssignment({
        supabase,
        data: { ...employeeProjectAssignmentData, employee_id: data.id },
        bypassAuth,
      });

    const { error: employeeAddressesError } = await createEmployeeAddresses({
      supabase,
      data: { ...employeeAddressesData, employee_id: data.id },
      bypassAuth,
    });

    const { error: employeeGuardiansError } = await createEmployeeGuardians({
      supabase,
      data: { ...employeeGuardiansData, employee_id: data.id },
      bypassAuth,
    });

    return {
      data,
      status,
      employeeError: null,
      employeeStatutoryDetailsError,
      employeeBankDetailsError,
      employeeProjectAssignmentError,
      employeeAddressesError,
      employeeGuardiansError,
    };
  }

  return {
    data,
    status,
    employeeError: null,
    employeeStatutoryDetailsError: null,
    employeeBankDetailsError: null,
    employeeProjectAssignmentError: null,
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
    .eq("id", id);

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
    .eq("id", id);

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
    .eq("id", id);

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
    .eq("id", id);

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
    .eq("id", id);

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
    .from("employee_project_assignment")
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
    .from("employee_project_assignment")
    .update(updateData)
    .eq("employee_id", data.employee_id!)
    .select()
    .single();

  if (error) {
    console.error("error", error);
  }

  return { status, error };
}

export async function createEmployeePersonalsFromImportedData({
  supabase,
  data,
  import_type,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeDatabaseInsert[];
  import_type?: string;
}) {
  const { data: existingRecords, error } =
    await getAllEmployeeNonDuplicatingDetailsFromPersonals({
      supabase,
    });
  if (error) {
    console.error(error);
  }

  if (import_type === "skip") {
    const newData = data.filter((entry) => {
      return !existingRecords?.some((existing) => {
        const normalize = (value: any) => String(value).trim().toLowerCase();

        return (
          normalize(existing.employee_code) ===
            normalize(entry.employee_code) ||
          normalize(existing.primary_mobile_number) ===
            normalize(entry.primary_mobile_number) ||
          normalize(existing.secondary_mobile_number) ===
            normalize(entry.secondary_mobile_number) ||
          normalize(existing.personal_email) === normalize(entry.personal_email)
        );
      });
    });

    if (newData.length === 0) {
      return { status: "No new data to insert", error: null };
    }

    const { error, status } = await supabase.from("employees").upsert(newData, {
      onConflict:
        "employee_code,primary_mobile_number,secondary_mobile_number,personal_email",
    });

    if (error) {
      console.error("Error inserting employee personals data:", error);
      return { status, error };
    }

    return { status, error: null };
  }
  if (import_type === "overwrite") {
    const newData: EmployeeDatabaseInsert[] = [];
    const conflictingData: EmployeeDatabaseInsert[] = [];

    // biome-ignore lint/complexity/noForEach: <explanation>
    data.forEach((entry) => {
      const hasConflict = existingRecords?.some((existing) => {
        const normalize = (value: any) => String(value).trim().toLowerCase();

        return (
          normalize(existing.employee_code) === normalize(entry.employee_code)
        );
      });

      if (hasConflict) {
        conflictingData.push(entry);
      } else {
        newData.push(entry);
      }
    });

    for (const entry of conflictingData) {
      const existing: EmployeeDatabaseInsert = existingRecords?.find(
        (existing) => existing.employee_code === entry.employee_code
      );

      if (existing) {
        const updateData: Partial<EmployeeDatabaseInsert> = {
          primary_mobile_number:
            entry.primary_mobile_number !== existing.primary_mobile_number
              ? entry.primary_mobile_number
              : existing.primary_mobile_number,
          secondary_mobile_number:
            entry.secondary_mobile_number !== existing.secondary_mobile_number
              ? entry.secondary_mobile_number
              : existing.secondary_mobile_number,
          personal_email:
            entry.personal_email !== existing.personal_email
              ? entry.personal_email
              : existing.personal_email,
          first_name:
            entry.first_name !== existing.first_name
              ? entry.first_name
              : existing.first_name,
          middle_name:
            entry.middle_name !== existing.middle_name
              ? entry.middle_name
              : existing.middle_name,
          last_name:
            entry.last_name !== existing.last_name
              ? entry.last_name
              : existing.last_name,
          date_of_birth:
            entry.date_of_birth !== existing.date_of_birth
              ? entry.date_of_birth
              : existing.date_of_birth,
          gender:
            entry.gender !== existing.gender ? entry.gender : existing.gender,
          education:
            entry.education !== existing.education
              ? entry.education
              : existing.education,
          marital_status:
            entry.marital_status !== existing.marital_status
              ? entry.marital_status
              : existing.marital_status,
          nationality:
            entry.nationality !== existing.nationality
              ? entry.nationality
              : existing.nationality,
          is_active:
            entry.is_active !== existing.is_active
              ? entry.is_active
              : existing.is_active,
        };

        const { error: updateError, status } = await supabase
          .from("employees")
          .update(updateData)
          .eq("employee_code", existing.employee_code);

        if (updateError) {
          console.error(
            "Error updating conflicting employee record:",
            updateError
          );
          return {
            status,
            error: updateError,
          };
        }
      }
    }

    if (newData.length > 0) {
      const { error: insertError, status: insertStatus } = await supabase
        .from("employees")
        .upsert(newData, {
          onConflict: "employee_code",
        });

      if (insertError) {
        console.error("Error inserting new employee records:", insertError);
        return { status: insertStatus, error: insertError };
      }
    }

    return { status: "Data processed successfully", error: null };
  }
}

export async function createEmployeeStatutoryFromImportedData({
  supabase,
  data,
  import_type,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeStatutoryDetailsDatabaseInsert[];
  import_type?: string;
}) {
  const { data: existingRecords, error } =
    await getAllEmployeeNonDuplicatingDetailsFromStatutory({
      supabase,
    });
  if (error) {
    console.error(error);
  }
  if (import_type === "skip") {
    const newData = data.filter((entry) => {
      return !existingRecords?.some((existing) => {
        const normalize = (value: any) => String(value).trim().toLowerCase();

        return (
          normalize(existing.employee_id) === normalize(entry.employee_id) ||
          normalize(existing.aadhaar_number) ===
            normalize(entry.aadhaar_number) ||
          normalize(existing.pan_number) === normalize(entry.pan_number) ||
          normalize(existing.uan_number) === normalize(entry.uan_number) ||
          normalize(existing.pf_number) === normalize(entry.pf_number) ||
          normalize(existing.esic_number) === normalize(entry.esic_number) ||
          normalize(existing.driving_license_number) ===
            normalize(entry.driving_license_number) ||
          normalize(existing.passport_number) ===
            normalize(entry.passport_number)
        );
      });
    });

    if (newData.length === 0) {
      return { status: "No new data to insert", error: null };
    }

    const { error, status } = await supabase
      .from("employee_statutory_details")
      .upsert(newData, {
        onConflict:
          "aadhaar_number,pan_number,uan_number,pf_number,esic_number,driving_license_number,passport_number",
      });

    if (error) {
      console.error("Error inserting employee statutory data:", error);
      return { status, error };
    }

    return { status, error: null };
  }
  if (import_type === "overwrite") {
    const newData: EmployeeStatutoryDetailsDatabaseInsert[] = [];
    const conflictingData: EmployeeStatutoryDetailsDatabaseInsert[] = [];

    // biome-ignore lint/complexity/noForEach: <explanation>
    data.forEach((entry) => {
      const hasConflict = existingRecords?.some((existing) => {
        const normalize = (value: any) => String(value).trim().toLowerCase();

        return normalize(existing.employee_id) === normalize(entry.employee_id);
      });

      if (hasConflict) {
        conflictingData.push(entry);
      } else {
        newData.push(entry);
      }
    });

    for (const entry of conflictingData) {
      const existing: EmployeeStatutoryDetailsDatabaseInsert =
        existingRecords?.find(
          (existing) => existing.employee_id === entry.employee_id
        );

      if (existing) {
        const updateData: Partial<EmployeeStatutoryDetailsDatabaseInsert> = {
          aadhaar_number:
            entry.aadhaar_number !== existing.aadhaar_number
              ? entry.aadhaar_number
              : existing.aadhaar_number,
          pan_number:
            entry.pan_number !== existing.pan_number
              ? entry.pan_number
              : existing.pan_number,
          uan_number:
            entry.uan_number !== existing.uan_number
              ? entry.uan_number
              : existing.uan_number,
          pf_number:
            entry.pf_number !== existing.pf_number
              ? entry.pf_number
              : existing.pf_number,
          esic_number:
            entry.esic_number !== existing.esic_number
              ? entry.esic_number
              : existing.esic_number,
          driving_license_number:
            entry.driving_license_number !== existing.driving_license_number
              ? entry.driving_license_number
              : existing.driving_license_number,
          passport_number:
            entry.passport_number !== existing.passport_number
              ? entry.passport_number
              : existing.passport_number,
          driving_license_expiry:
            entry.driving_license_expiry !== existing.driving_license_expiry
              ? entry.driving_license_expiry
              : existing.driving_license_expiry,
          passport_expiry:
            entry.passport_expiry !== existing.passport_expiry
              ? entry.passport_expiry
              : existing.passport_expiry,
        };

        const { error: updateError } = await supabase
          .from("employee_statutory_details")
          .update(updateData)
          .eq("employee_id", existing.employee_id);

        if (updateError) {
          console.error(
            "Error updating conflicting employee record:",
            updateError
          );
          return {
            status: "Error updating conflicting data",
            error: updateError,
          };
        }
      }
    }

    if (newData.length > 0) {
      const { error: insertError, status: insertStatus } = await supabase
        .from("employee_statutory_details")
        .upsert(newData, {
          onConflict: "employee_id",
        });

      if (insertError) {
        console.error("Error inserting new employee records:", insertError);
        return { status: insertStatus, error: insertError };
      }
    }

    return { status: "Data processed successfully", error: null };
  }
}

export async function createEmployeeBankingFromImportedData({
  supabase,
  data,
  import_type,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeBankDetailsDatabaseInsert[];
  import_type?: string;
}) {
  const { data: existingRecords, error: fetchError } = await supabase
    .from("employee_bank_details")
    .select("account_number,employee_id");

  if (fetchError) {
    console.error("Error fetching existing records:", fetchError);
    return { error: fetchError };
  }
  if (import_type === "skip") {
    const newData = data.filter((entry) => {
      return !existingRecords?.some((existing) => {
        const normalize = (value: any) => String(value).trim().toLowerCase();

        return (
          normalize(existing.account_number) ===
            normalize(entry.account_number) ||
          normalize(existing.employee_id) === normalize(entry.employee_id)
        );
      });
    });

    if (newData.length === 0) {
      return { status: "No new data to insert", error: null };
    }

    const { error, status } = await supabase
      .from("employee_bank_details")
      .upsert(newData, {
        onConflict: "account_number",
      });

    if (error) {
      console.error("Error inserting employee banking data:", error);
      return { status, error };
    }

    return { status, error: null };
  }
  if (import_type === "overwrite") {
    const newData: EmployeeBankDetailsDatabaseInsert[] = [];
    const conflictingData: EmployeeBankDetailsDatabaseInsert[] = [];

    // biome-ignore lint/complexity/noForEach: <explanation>
    data.forEach((entry) => {
      const hasConflict = existingRecords?.some((existing) => {
        const normalize = (value: any) => String(value).trim().toLowerCase();

        return normalize(existing.employee_id) === normalize(entry.employee_id);
      });

      if (hasConflict) {
        conflictingData.push(entry);
      } else {
        newData.push(entry);
      }
    });

    for (const entry of conflictingData) {
      const existing: EmployeeBankDetailsDatabaseInsert = existingRecords?.find(
        (existing) => existing.employee_id === entry.employee_id
      );

      if (existing) {
        const updateData: Partial<EmployeeBankDetailsDatabaseInsert> = {
          account_holder_name:
            entry.account_holder_name !== existing.account_holder_name
              ? entry.account_holder_name
              : existing.account_holder_name,
          account_number:
            entry.account_number !== existing.account_number
              ? entry.account_number
              : existing.account_number,
          account_type:
            entry.account_type !== existing.account_type
              ? entry.account_type
              : existing.account_type,
          bank_name:
            entry.bank_name !== existing.bank_name
              ? entry.bank_name
              : existing.bank_name,
          branch_name:
            entry.branch_name !== existing.branch_name
              ? entry.branch_name
              : existing.branch_name,
          ifsc_code:
            entry.ifsc_code !== existing.ifsc_code
              ? entry.ifsc_code
              : existing.ifsc_code,
        };

        const { error: updateError } = await supabase
          .from("employee_bank_details")
          .update(updateData)
          .eq("employee_id", existing.employee_id);

        if (updateError) {
          console.error(
            "Error updating conflicting employee record:",
            updateError
          );
          return {
            status: "Error updating conflicting data",
            error: updateError,
          };
        }
      }
    }

    if (newData.length > 0) {
      const { error: insertError, status: insertStatus } = await supabase
        .from("employee_bank_details")
        .upsert(newData, {
          onConflict: "employee_id",
        });

      if (insertError) {
        console.error("Error inserting new employee records:", insertError);
        return { status: insertStatus, error: insertError };
      }
    }

    return { status: "Data processed successfully", error: null };
  }
}

export async function createEmployeeAddressFromImportedData({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeAddressDatabaseInsert[];
}) {
  const { error, status } = await supabase
    .from("employee_addresses")
    .insert(data)
    .select();

  if (error) {
    console.error(error);
  }

  return { status, error };
}

export async function createEmployeeGuardiansFromImportedData({
  supabase,
  data,
  import_type,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeGuardianDatabaseInsert[];
  import_type?: string;
}) {
  const { data: existingRecords, error } =
    await getAllEmployeeNonDuplicatingDetailsFromGuardians({
      supabase,
    });
  if (error) {
    console.error(error);
  }
  if (import_type === "skip") {
    const newData = data.filter((entry) => {
      return !existingRecords?.some((existing) => {
        const normalize = (value: any) => String(value).trim().toLowerCase();

        return (
          normalize(existing.mobile_number) ===
            normalize(entry.mobile_number) ||
          normalize(existing.alternate_mobile_number) ===
            normalize(entry.alternate_mobile_number) ||
          normalize(existing.email) === normalize(entry.email)
        );
      });
    });

    if (newData.length === 0) {
      return { status: "No new data to insert", error: null };
    }

    const { error, status } = await supabase
      .from("employee_guardians")
      .upsert(newData, {
        onConflict: "mobile_number,alternate_mobile_number,email",
      });

    if (error) {
      console.error("Error inserting employee guardians data:", error);
      return { status, error };
    }

    return { status, error: null };
  }
  if (import_type === "overwrite") {
    const newData: EmployeeGuardianDatabaseInsert[] = [];
    const conflictingData: EmployeeGuardianDatabaseInsert[] = [];

    // biome-ignore lint/complexity/noForEach: <explanation>
    data.forEach((entry) => {
      const hasConflict = existingRecords?.some((existing) => {
        const normalize = (value: any) => String(value).trim().toLowerCase();

        return (
          normalize(existing.mobile_number) ===
            normalize(entry.mobile_number) ||
          normalize(existing.alternate_mobile_number) ===
            normalize(entry.alternate_mobile_number) ||
          normalize(existing.email) === normalize(entry.email)
        );
      });

      if (hasConflict) {
        conflictingData.push(entry);
      } else {
        newData.push(entry);
      }
    });

    for (const entry of conflictingData) {
      const existing: EmployeeGuardianDatabaseInsert = existingRecords?.find(
        (existing) =>
          existing.mobile_number === entry.mobile_number ||
          existing.alternate_mobile_number === entry.alternate_mobile_number ||
          existing.email === entry.email
      );

      if (existing) {
        const updateData: Partial<EmployeeGuardianDatabaseInsert> = {
          first_name:
            entry.first_name !== existing.first_name
              ? entry.first_name
              : existing.first_name,
          last_name:
            entry.last_name !== existing.last_name
              ? entry.last_name
              : existing.last_name,
          relationship:
            entry.relationship !== existing.relationship
              ? entry.relationship
              : existing.relationship,
          date_of_birth:
            entry.date_of_birth !== existing.date_of_birth
              ? entry.date_of_birth
              : existing.date_of_birth,
          gender:
            entry.gender !== existing.gender ? entry.gender : existing.gender,
          mobile_number:
            entry.mobile_number !== existing.mobile_number
              ? entry.mobile_number
              : existing.mobile_number,
          alternate_mobile_number:
            entry.alternate_mobile_number !== existing.alternate_mobile_number
              ? entry.alternate_mobile_number
              : existing.alternate_mobile_number,
          email: entry.email !== existing.email ? entry.email : existing.email,
          address_same_as_employee:
            entry.address_same_as_employee !== existing.address_same_as_employee
              ? entry.address_same_as_employee
              : existing.address_same_as_employee,
          is_emergency_contact:
            entry.is_emergency_contact !== existing.is_emergency_contact
              ? entry.is_emergency_contact
              : existing.is_emergency_contact,
        };

        const { error: updateError } = await supabase
          .from("employee_guardians")
          .update(updateData)
          .or(
            `mobile_number.eq.${existing.mobile_number},alternate_mobile_number.eq.${existing.alternate_mobile_number},email.eq.${existing.email}`
          );

        if (updateError) {
          console.error(
            "Error updating conflicting employee record:",
            updateError
          );
          return {
            status: "Error updating conflicting data",
            error: updateError,
          };
        }
      }
    }

    if (newData.length > 0) {
      const { error: insertError, status: insertStatus } = await supabase
        .from("employee_bank_details")
        .upsert(newData, {
          onConflict: "employee_id",
        });

      if (insertError) {
        console.error("Error inserting new employee records:", insertError);
        return { status: insertStatus, error: insertError };
      }
    }

    return { status: "Data processed successfully", error: null };
  }
}
