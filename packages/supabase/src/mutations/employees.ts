import {
  convertToNull,
  type employeeDocumentTypeArray,
} from "@canny_ecosystem/utils";
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
import type { ImportEmployeeDetailsDataType } from "../queries";

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
  employeeStatutoryDetailsData?: Omit<
    EmployeeStatutoryDetailsDatabaseInsert,
    "employee_id"
  >;
  employeeBankDetailsData?: Omit<
    EmployeeBankDetailsDatabaseInsert,
    "employee_id"
  >;
  employeeProjectAssignmentData?: Omit<
    EmployeeProjectAssignmentDatabaseInsert,
    "employee_id"
  >;
  employeeAddressesData?: Omit<EmployeeAddressDatabaseInsert, "employee_id">;
  employeeGuardiansData?: Omit<EmployeeGuardianDatabaseInsert, "employee_id">;
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
    console.error("createEmployee Error:", error);
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

  if (!data?.id) {
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

  const [
    { error: statutoryError, status: statutoryStatus },
    { error: bankError, status: bankStatus },
    { error: projectError, status: projectStatus },
    { error: addressError, status: addressStatus },
    { error: guardianError, status: guardianStatus },
  ] = await Promise.all([
    employeeStatutoryDetailsData
      ? createEmployeeStatutoryDetails({
          supabase,
          data: { ...employeeStatutoryDetailsData, employee_id: data.id },
          bypassAuth,
        })
      : { error: null, status: null },
    employeeBankDetailsData
      ? createEmployeeBankDetails({
          supabase,
          data: { ...employeeBankDetailsData, employee_id: data.id },
          bypassAuth,
        })
      : { error: null, status: null },
    employeeProjectAssignmentData
      ? createEmployeeProjectAssignment({
          supabase,
          data: { ...employeeProjectAssignmentData, employee_id: data.id },
          bypassAuth,
        })
      : { error: null, status: null },
    employeeAddressesData
      ? createEmployeeAddresses({
          supabase,
          data: { ...employeeAddressesData, employee_id: data.id },
          bypassAuth,
        })
      : { error: null, status: null },
    employeeGuardiansData
      ? createEmployeeGuardians({
          supabase,
          data: { ...employeeGuardiansData, employee_id: data.id },
          bypassAuth,
        })
      : { error: null, status: null },
  ]);

  const latestStatus =
    guardianStatus ||
    addressStatus ||
    projectStatus ||
    bankStatus ||
    statutoryStatus ||
    status;

  return {
    id: data.id,
    data,
    status: latestStatus,
    employeeError: null,
    employeeStatutoryDetailsError: statutoryError,
    employeeBankDetailsError: bankError,
    employeeProjectAssignmentError: projectError,
    employeeAddressesError: addressError,
    employeeGuardiansError: guardianError,
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
    .eq("id", data.id!);
  if (error) {
    console.error("updateEmployee Error:", error);
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
    console.error("deleteEmployee Error:", error);
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
    console.error("createEmployeeStatutoryDetails Error:", error);
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
    console.error("createEmployeeBankDetails Error:", error);
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
    console.error("createEmployeeAddresses Error:", error);
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
    console.error("createEmployeeGuardians Error:", error);
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
    .eq("employee_id", data.employee_id!);
  if (error) {
    console.error("updateEmployeeStatutoryDetails Error:", error);
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
    .eq("employee_id", data.employee_id!);
  if (error) {
    console.error("updateEmployeeBankDetails Error:", error);
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
    .eq("id", data.id!);
  if (error) {
    console.error("updateEmployeeAddress Error:", error);
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
    console.error("deleteEmployeeAddress Error:", error);
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
    .eq("id", data.id!);
  if (error) {
    console.error("updateEmployeeGuardian Error:", error);
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
    console.error("deleteEmployeeGuardian Error:", error);
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
    console.error("createEmployeeSkill Error:", error);
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
    .eq("id", data.id!);
  if (error) {
    console.error("updateEmployeeSkill Error:", error);
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
    console.error("deleteEmployeeSkill Error:", error);
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
    console.error("createEmployeeWorkHistory Error:", error);
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
    .eq("id", data.id!);
  if (error) {
    console.error("updateEmployeeWorkHistory Error:", error);
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
    console.error("deleteEmployeeWorkHistory Error:", error);
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
    console.error("createEmployeeProjectAssignment Error:", error);
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
    .eq("employee_id", data.employee_id!);

  if (error) {
    console.error("updateEmployeeProjectAssignment Error:", error);
  }

  return { status, error };
}

export async function getEmployeeDetailsConflicts({
  supabase,
  importedData,
}: {
  supabase: TypedSupabaseClient;
  importedData: ImportEmployeeDetailsDataType[];
}) {
  const employeeCodes = [
    ...new Set(importedData.map((emp) => emp.employee_code)),
  ];
  const primaryPhones = [
    ...new Set(importedData.map((emp) => emp.primary_mobile_number)),
  ];
  const secondaryPhones = [
    ...new Set(importedData.map((emp) => emp.secondary_mobile_number)),
  ];
  const emails = [...new Set(importedData.map((emp) => emp.personal_email))];

  const query = supabase
    .from("employees")
    .select(
      `
      id,
      employee_code,
      primary_mobile_number,
      secondary_mobile_number,
      personal_email
    `
    )
    .or(
      [
        `employee_code.in.(${employeeCodes.map((code) => code).join(",")})`,
        `primary_mobile_number.in.(${primaryPhones
          .map((phone) => phone)
          .join(",")})`,
        `secondary_mobile_number.in.(${secondaryPhones
          .map((phone) => phone)
          .join(",")})`,
        `personal_email.in.(${emails.map((email) => email).join(",")})`,
      ].join(",")
    );

  const { data: conflictingRecords, error } = await query;

  if (error) {
    console.error("Error fetching conflicts:", error);
    return { conflictingIndices: [], error };
  }

  const conflictingIndices = importedData.reduce(
    (indices: number[], record, index) => {
      const hasConflict = conflictingRecords?.some(
        (existing) =>
          existing.employee_code === record.employee_code ||
          existing.primary_mobile_number === record.primary_mobile_number ||
          existing.secondary_mobile_number === record.secondary_mobile_number ||
          existing.personal_email === record.personal_email
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

export async function createEmployeeDetailsFromImportedData({
  supabase,
  data,
  import_type,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeDatabaseInsert[];
  import_type?: string;
}) {
  if (!data || data.length === 0) {
    return { status: 404, error: { message: "No data provided" } };
  }

  const employeeCodes = [...new Set(data.map((emp) => emp.employee_code))];
  const primaryPhones = [
    ...new Set(data.map((emp) => emp.primary_mobile_number)),
  ];
  const secondaryPhones = [
    ...new Set(data.map((emp) => emp.secondary_mobile_number)),
  ];
  const emails = [...new Set(data.map((emp) => emp.personal_email))];

  const query = supabase
    .from("employees")
    .select(
      `id,
      employee_code,
      primary_mobile_number,
      secondary_mobile_number,
      personal_email`
    )
    .or(
      [
        `employee_code.in.(${employeeCodes.join(",")})`,
        `primary_mobile_number.in.(${primaryPhones.join(",")})`,
        `secondary_mobile_number.in.(${secondaryPhones.join(",")})`,
        `personal_email.in.(${emails.join(",")})`,
      ].join(",")
    );

  const { data: conflictingRecords, error } = await query;

  if (error) {
    console.error("Error fetching conflicts:", error);
    return { status: 400, error };
  }

  if (import_type === "skip") {
    const newData = data.filter((record) => {
      const hasConflict = conflictingRecords?.some(
        (existing) =>
          existing.employee_code === record.employee_code ||
          existing.primary_mobile_number === record.primary_mobile_number ||
          existing.secondary_mobile_number === record.secondary_mobile_number ||
          existing.personal_email === record.personal_email
      );
      return !hasConflict;
    });

    if (newData.length === 0) {
      return {
        status: 404,
        error: { message: "No new records to import" },
      };
    }

    const BATCH_SIZE = 50;

    for (let i = 0; i < newData.length; i += BATCH_SIZE) {
      const batch = newData.slice(i, Math.min(i + BATCH_SIZE, newData.length));

      const { error: insertError } = await supabase
        .from("employees")
        .insert(batch);
      if (insertError) {
        console.error("Error inserting batch:", insertError);
      }
    }

    return {
      status: 200,
      message: "Succesfull added details",
      error: null,
    };
  }

  if (import_type === "overwrite") {
    const results = await Promise.all(
      data.map(async (record) => {
        const conflictingRecord = conflictingRecords?.find(
          (existing) =>
            existing.employee_code === record.employee_code ||
            existing.primary_mobile_number === record.primary_mobile_number ||
            existing.secondary_mobile_number ===
              record.secondary_mobile_number ||
            existing.personal_email === record.personal_email
        );

        if (conflictingRecord) {
          const { error: updateError } = await supabase
            .from("employees")
            .update(record)
            .eq("employee_code", conflictingRecord.employee_code);

          return { type: "update", error: updateError };
        }

        const { error: insertError } = await supabase
          .from("employees")
          .insert(record);

        return { type: "insert", error: insertError };
      })
    );

    const errors = results.filter((r) => r.error);

    if (errors.length > 0) {
      console.error("Errors during processing:", errors);
    }

    return {
      status: 200,
      message: "Successfully processed updates and new insertions",
      error: null,
    };
  }

  return {
    status: 500,
    error: new Error("Invalid import_type"),
  };
}

export async function getEmployeeStatutoryConflicts({
  supabase,
  importedData,
}: {
  supabase: TypedSupabaseClient;
  importedData: EmployeeStatutoryDetailsDatabaseInsert[];
}) {
  const employeeIds = [...new Set(importedData.map((emp) => emp.employee_id))];
  const aadhaarNumbers = [
    ...new Set(importedData.map((emp) => emp.aadhaar_number)),
  ];
  const panNumbers = [...new Set(importedData.map((emp) => emp.pan_number))];
  const uanNumbers = [...new Set(importedData.map((emp) => emp.uan_number))];
  const pfNumbers = [...new Set(importedData.map((emp) => emp.pf_number))];
  const esicNumbers = [...new Set(importedData.map((emp) => emp.esic_number))];
  const drivings = [
    ...new Set(importedData.map((emp) => emp.driving_license_number)),
  ];
  const passports = [
    ...new Set(importedData.map((emp) => emp.passport_number)),
  ];

  const query = supabase
    .from("employee_statutory_details")
    .select(
      `
      employee_id,
      aadhaar_number,
      pan_number,
      uan_number,
      pf_number,
      esic_number,
      driving_license_number,
      passport_number
    `
    )
    .or(
      [
        `employee_id.in.(${employeeIds.map((id) => id).join(",")})`,
        `aadhaar_number.in.(${aadhaarNumbers.map((num) => num).join(",")})`,
        `pan_number.in.(${panNumbers.map((num) => num).join(",")})`,
        `uan_number.in.(${uanNumbers.map((num) => num).join(",")})`,
        `pf_number.in.(${pfNumbers.map((num) => num).join(",")})`,
        `esic_number.in.(${esicNumbers.map((num) => num).join(",")})`,
        `driving_license_number.in.(${drivings.map((num) => num).join(",")})`,
        `passport_number.in.(${passports.map((num) => num).join(",")})`,
      ].join(",")
    );

  const { data: conflictingRecords, error } = await query;

  if (error) {
    console.error("Error fetching conflicts:", error);
    return { conflictingIndices: [], error };
  }

  const conflictingIndices = importedData.reduce(
    (indices: number[], record, index) => {
      const hasConflict = conflictingRecords?.some(
        (existing) =>
          existing.employee_id === record.employee_id ||
          existing.aadhaar_number === record.aadhaar_number ||
          existing.pan_number === record.pan_number ||
          existing.uan_number === record.uan_number ||
          existing.pf_number === record.pf_number ||
          existing.esic_number === record.esic_number ||
          existing.driving_license_number === record.driving_license_number ||
          existing.passport_number === record.passport_number
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

export async function createEmployeeStatutoryFromImportedData({
  supabase,
  data,
  import_type,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeStatutoryDetailsDatabaseInsert[];
  import_type?: string;
}) {
  if (!data || data.length === 0) {
    return { status: 404, error: { message: "No data provided" } };
  }

  const identifiers = data.map((entry) => ({
    employee_id: entry.employee_id,
    aadhaar_number: entry.aadhaar_number,
    pan_number: entry.pan_number,
    uan_number: entry.uan_number,
    pf_number: entry.pf_number,
    esic_number: entry.esic_number,
    driving_license_number: entry.driving_license_number,
    passport_number: entry.passport_number,
  }));

  const { data: existingRecords, error: existingError } = await supabase
    .from("employee_statutory_details")
    .select(
      "employee_id, aadhaar_number, pan_number, uan_number, pf_number, esic_number, driving_license_number, passport_number"
    )
    .in(
      "employee_id",
      identifiers.map((entry) => entry.employee_id).filter(Boolean)
    );
  if (existingError) {
    console.error("Error fetching existing records:", existingError);
    return { status: 400, error: existingError };
  }

  const normalize = (value: any) =>
    String(value || "")
      .trim()
      .toLowerCase();

  const existingSets = {
    ids: new Set(existingRecords?.map((e) => normalize(e.employee_id)) || []),
    aadhaars: new Set(
      existingRecords?.map((e) => normalize(e.aadhaar_number)) || []
    ),
    pans: new Set(existingRecords?.map((e) => normalize(e.pan_number)) || []),
    uans: new Set(existingRecords?.map((e) => normalize(e.uan_number)) || []),
    pfs: new Set(existingRecords?.map((e) => normalize(e.pf_number)) || []),
    esics: new Set(existingRecords?.map((e) => normalize(e.esic_number)) || []),
    drivingLicenses: new Set(
      existingRecords?.map((e) => normalize(e.driving_license_number)) || []
    ),
    passports: new Set(
      existingRecords?.map((e) => normalize(e.passport_number)) || []
    ),
  };

  if (import_type === "skip") {
    const newData = data.filter((entry) => {
      const hasConflict =
        existingSets.ids.has(normalize(entry.employee_id)) ||
        (entry.aadhaar_number &&
          existingSets.aadhaars.has(normalize(entry.aadhaar_number))) ||
        (entry.pan_number &&
          existingSets.pans.has(normalize(entry.pan_number))) ||
        (entry.uan_number &&
          existingSets.uans.has(normalize(entry.uan_number))) ||
        (entry.pf_number && existingSets.pfs.has(normalize(entry.pf_number))) ||
        (entry.esic_number &&
          existingSets.esics.has(normalize(entry.esic_number))) ||
        (entry.driving_license_number &&
          existingSets.drivingLicenses.has(
            normalize(entry.driving_license_number)
          )) ||
        (entry.passport_number &&
          existingSets.passports.has(normalize(entry.passport_number)));

      return !hasConflict;
    });

    if (newData.length === 0) {
      return {
        status: 404,
        error: { message: "No new data to insert after filtering duplicates" },
      };
    }

    const BATCH_SIZE = 50;

    for (let i = 0; i < newData.length; i += BATCH_SIZE) {
      const batch = newData.slice(i, Math.min(i + BATCH_SIZE, newData.length));

      const { error: insertError } = await supabase
        .from("employee_statutory_details")
        .insert(batch);
      if (insertError) {
        console.error("Error inserting batch:", insertError);
      }
    }

    return {
      status: 200,
      message: "Successfully inserted new records",
      error: null,
    };
  }

  if (import_type === "overwrite") {
    const results = await Promise.all(
      data.map(async (record) => {
        const existingRecord = existingRecords?.find(
          (existing) =>
            normalize(existing.employee_id) === normalize(record.employee_id) ||
            (record.aadhaar_number &&
              normalize(existing.aadhaar_number) ===
                normalize(record.aadhaar_number)) ||
            (record.pan_number &&
              normalize(existing.pan_number) ===
                normalize(record.pan_number)) ||
            (record.uan_number &&
              normalize(existing.uan_number) ===
                normalize(record.uan_number)) ||
            (record.pf_number &&
              normalize(existing.pf_number) === normalize(record.pf_number)) ||
            (record.esic_number &&
              normalize(existing.esic_number) ===
                normalize(record.esic_number)) ||
            (record.driving_license_number &&
              normalize(existing.driving_license_number) ===
                normalize(record.driving_license_number)) ||
            (record.passport_number &&
              normalize(existing.passport_number) ===
                normalize(record.passport_number))
        );

        if (existingRecord) {
          const { error: updateError } = await supabase
            .from("employee_statutory_details")
            .update(record)
            .eq("employee_id", existingRecord.employee_id);

          return { type: "update", error: updateError };
        }

        const { error: insertError } = await supabase
          .from("employee_statutory_details")
          .insert(record);

        return { type: "insert", error: insertError };
      })
    );

    const errors = results.filter((r) => r.error);

    if (errors.length > 0) {
      console.error("Errors during processing:", errors);
    }

    return {
      status: 200,
      message: "Successfully processed updates and new insertions",
      error: null,
    };
  }

  return {
    status: 500,
    error: new Error("Invalid import_type"),
  };
}

export async function getEmployeeBankDetailsConflicts({
  supabase,
  importedData,
}: {
  supabase: TypedSupabaseClient;
  importedData: EmployeeBankDetailsDatabaseInsert[];
}) {
  const employeeIds = [...new Set(importedData.map((emp) => emp.employee_id))];
  const accountNumbers = [
    ...new Set(importedData.map((emp) => emp.account_number)),
  ];

  const query = supabase
    .from("employee_bank_details")
    .select(
      `
      employee_id,
      account_number
    `
    )
    .or(
      [
        `employee_id.in.(${employeeIds.map((id) => id).join(",")})`,
        `account_number.in.(${accountNumbers.map((num) => num).join(",")})`,
      ].join(",")
    );

  const { data: conflictingRecords, error } = await query;

  if (error) {
    console.error("Error fetching conflicts:", error);
    return { conflictingIndices: [], error };
  }

  const conflictingIndices = importedData.reduce(
    (indices: number[], record, index) => {
      const hasConflict = conflictingRecords?.some(
        (existing) =>
          existing.employee_id === record.employee_id ||
          existing.account_number === record.account_number
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

export async function createEmployeeBankDetailsFromImportedData({
  supabase,
  data,
  import_type,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeBankDetailsDatabaseInsert[];
  import_type?: string;
}) {
  if (!data || data.length === 0) {
    return { status: 404, error: null };
  }

  const identifiers = data.map((entry) => ({
    employee_id: entry.employee_id,
    accountnumber: entry.account_number,
  }));

  const { data: existingRecords, error: existingError } = await supabase
    .from("employee_bank_details")
    .select("employee_id, account_number")
    .in(
      "employee_id",
      identifiers.map((entry) => entry.employee_id).filter(Boolean)
    );
  if (existingError) {
    console.error("Error fetching existing records:", existingError);
    return { status: 500, error: existingError };
  }

  const normalize = (value: any) =>
    String(value || "")
      .trim()
      .toLowerCase();

  const existingSets = {
    ids: new Set(existingRecords?.map((e) => normalize(e.employee_id)) || []),
    accounts: new Set(
      existingRecords?.map((e) => normalize(e.account_number)) || []
    ),
  };

  if (import_type === "skip") {
    const newData = data.filter((entry) => {
      const hasConflict =
        existingSets.ids.has(normalize(entry.employee_id)) ||
        (entry.account_number &&
          existingSets.accounts.has(normalize(entry.account_number)));

      return !hasConflict;
    });

    if (newData.length === 0) {
      return {
        status: 404,
        error: { message: "No new data to insert after filtering duplicates" },
      };
    }

    const BATCH_SIZE = 50;

    for (let i = 0; i < newData.length; i += BATCH_SIZE) {
      const batch = newData.slice(i, Math.min(i + BATCH_SIZE, newData.length));

      const { error: insertError } = await supabase
        .from("employee_bank_details")
        .insert(batch);
      if (insertError) {
        console.error("Error inserting batch:", insertError);
      }
    }

    return {
      status: 200,
      message: "Successfully inserted new records",
      error: null,
    };
  }

  if (import_type === "overwrite") {
    const results = await Promise.all(
      data.map(async (record) => {
        const existingRecord = existingRecords?.find(
          (existing) =>
            normalize(existing.employee_id) === normalize(record.employee_id) ||
            (record.account_number &&
              normalize(existing.account_number) ===
                normalize(record.account_number))
        );

        if (existingRecord) {
          const { error: updateError } = await supabase
            .from("employee_bank_details")
            .update(record)
            .eq("employee_id", existingRecord.employee_id);

          return { type: "update", error: updateError };
        }

        const { error: insertError } = await supabase
          .from("employee_bank_details")
          .insert(record);

        return { type: "insert", error: insertError };
      })
    );

    const errors = results.filter((r) => r.error);

    if (errors.length > 0) {
      console.error("Errors during processing:", errors);
    }

    return {
      status: 200,
      message: "Successfully processed updates and new insertions",
      error: null,
    };
  }

  return {
    status: 500,
    error: new Error("Invalid import_type"),
  };
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
    .insert(data);
  if (error) {
    console.error("createEmployeeAddressFromImportedData Error", error);
  }

  return { status, error };
}

export async function getEmployeeGuardiansConflicts({
  supabase,
  importedData,
}: {
  supabase: TypedSupabaseClient;
  importedData: EmployeeGuardianDatabaseInsert[];
}) {
  const mobileNumbers = [
    ...new Set(importedData.map((emp) => emp.mobile_number)),
  ];
  const alternateMobileNumbers = [
    ...new Set(importedData.map((emp) => emp.alternate_mobile_number)),
  ];
  const emails = [...new Set(importedData.map((emp) => emp.email))];

  const query = supabase
    .from("employee_guardians")
    .select(
      `
      mobile_number,
      alternate_mobile_number,
      email
    `
    )
    .or(
      [
        `mobile_number.in.(${mobileNumbers.map((num) => num).join(",")})`,
        `alternate_mobile_number.in.(${alternateMobileNumbers
          .map((num) => num)
          .join(",")})`,
        `email.in.(${emails.map((email) => email).join(",")})`,
      ].join(",")
    );

  const { data: conflictingRecords, error } = await query;

  if (error) {
    console.error("Error fetching conflicts:", error);
    return { conflictingIndices: [], error };
  }

  const conflictingIndices = importedData.reduce(
    (indices: number[], record, index) => {
      const hasConflict = conflictingRecords?.some(
        (existing) =>
          existing.mobile_number === record.mobile_number ||
          existing.alternate_mobile_number === record.alternate_mobile_number ||
          existing.email === record.email
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

export async function createEmployeeGuardiansFromImportedData({
  supabase,
  data,
  import_type,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeGuardianDatabaseInsert[] | EmployeeGuardianDatabaseUpdate[];
  import_type?: string;
}) {
  if (!data || data.length === 0) {
    return { status: 404, error: { message: "No data provided" } };
  }

  const normalize = (value: any) =>
    String(value || "")
      .trim()
      .toLowerCase();

  const orConditions = data.map((entry) =>
    [
      entry.mobile_number ? `mobile_number.eq.${entry.mobile_number}` : null,
      entry.alternate_mobile_number
        ? `alternate_mobile_number.eq.${entry.alternate_mobile_number}`
        : null,
      entry.email ? `email.eq.${entry.email}` : null,
    ]
      .filter(Boolean)
      .join(",")
  );

  const { data: existingRecords, error: fetchError } = await supabase
    .from("employee_guardians")
    .select("*")
    .or(orConditions.join(","));

  if (fetchError) {
    console.error("Error fetching existing records:", fetchError);
    return { status: 402, error: fetchError };
  }

  const existingSets = {
    mobileNumbers: new Set(
      existingRecords?.map((e) => normalize(e.mobile_number)) || []
    ),
    alternateMobileNumbers: new Set(
      existingRecords?.map((e) => normalize(e.alternate_mobile_number)) || []
    ),
    emails: new Set(existingRecords?.map((e) => normalize(e.email)) || []),
  };

  if (import_type === "skip") {
    const newData = data.filter((entry) => {
      const hasConflict =
        existingSets.mobileNumbers.has(normalize(entry.mobile_number)) ||
        existingSets.alternateMobileNumbers.has(
          normalize(entry.alternate_mobile_number)
        ) ||
        existingSets.emails.has(normalize(entry.email));

      return !hasConflict;
    });

    if (newData.length === 0) {
      return { status: 404, error: { message: "No new data found" } };
    }

    const { error, status } = await supabase
      .from("employee_guardians")
      .upsert(newData as EmployeeAddressDatabaseInsert[]);

    if (error) {
      console.error("Error inserting employee guardians data:", error);
    }

    return { status, error };
  }

  if (import_type === "overwrite") {
    for (const entry of data) {
      const existing = existingRecords?.find(
        (record) =>
          normalize(record.mobile_number) === normalize(entry.mobile_number) ||
          normalize(record.alternate_mobile_number) ===
            normalize(entry.alternate_mobile_number) ||
          normalize(record.email) === normalize(entry.email)
      );

      if (existing) {
        let updateData: typeof entry = {};

        const keys = Object.keys(entry);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i] as keyof typeof entry;
          if (entry[key!] !== existing[key!]) {
            updateData = {
              ...updateData,
              [key]: entry[key!],
            };
          }
        }

        if (Object.keys(updateData).length > 0) {
          const { error: updateError } = await supabase
            .from("employee_guardians")
            .update(updateData)
            .eq("id", existing.id);

          if (updateError) {
            console.error("Error updating record:", updateError);
          }
        }
      } else {
        const { error: insertError } = await supabase
          .from("employee_guardians")
          .insert(entry as EmployeeGuardianDatabaseInsert);

        if (insertError) {
          console.error("Error inserting new record:", insertError);
        }
      }
    }

    return { status: 200, error: null };
  }

  return {
    status: 500,
    error: new Error("Invalid import_type"),
  };
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
    return { status: 404, error: null };
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
    return { status: 403, error: existingError };
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
        status: 404,
        error: { message: "No new entries added" },
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
      status: 200,
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
      status: 200,
      message: "Successfully processed updates and new insertions",
      error: null,
    };
  }

  return {
    status: 500,
    error: new Error("Invalid import_type"),
  };
}

// employee documents
export async function addEmployeeDocument({
  supabase,
  employee_id,
  document_type,
  url,
}: {
  supabase: TypedSupabaseClient;
  employee_id: string;
  document_type: (typeof employeeDocumentTypeArray)[number];
  url: string;
}) {
  const dataToBeInserted = convertToNull({ employee_id, document_type, url });
  const { status, error } = await supabase
    .from("employee_documents")
    .insert(dataToBeInserted);

  return { status, error };
}

export async function deleteEmployeeDocumentByEmployeeId({
  supabase,
  employeeId,
  documentType,
}: {
  supabase: TypedSupabaseClient;
  employeeId: string;
  documentType: (typeof employeeDocumentTypeArray)[number];
}) {
  const { error, status } = await supabase
    .from("employee_documents")
    .delete()
    .eq("employee_id", employeeId)
    .eq("document_type", documentType);

  return { status, error };
}
