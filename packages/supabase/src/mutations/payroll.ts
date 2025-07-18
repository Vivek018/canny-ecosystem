import type {
  PayrollDatabaseInsert,
  PayrollDatabaseUpdate,
  PayrollFieldsDatabaseInsert,
  PayrollFieldsDatabaseRow,
  PayrollFieldsDatabaseUpdate,
  SalaryEntriesDatabaseInsert,
  SalaryEntriesDatabaseUpdate,
  SalaryFieldValuesDatabaseInsert,
  SalaryFieldValuesDatabaseUpdate,
  TypedSupabaseClient,
} from "../types";
import {
  getPayrollById,
  getSalaryEntriesByPayrollAndEmployeeId,
  getSalaryEntryById,
} from "../queries";
import {
  calculateNetAmountAfterEntryCreated,
  convertToNull,
  isGoodStatus,
} from "@canny_ecosystem/utils";

// Salary Payroll
export async function createSalaryPayroll({
  supabase,
  data,
  companyId,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: {
    title: string;
    run_date?: string;
    rawData: any[];
    status?: "pending" | "approved" | "submitted";
    type: "salary";
    salaryEntryData: Omit<SalaryEntriesDatabaseInsert, "payroll_id">[];
    totalEmployees: number;
    totalNetAmount: number;
    month: number;
    year: number;
    payrollFieldsData: PayrollFieldsDatabaseRow[];
  };
  companyId: string;
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

  const {
    data: payrollData,
    status: payrollStatus,
    error: payrollError,
  } = await supabase
    .from("payroll")
    .insert({
      title: data.title,
      month: data.month,
      year: data.year,
      run_date: data.run_date ?? null,
      status: data?.status ?? "pending",
      total_employees: data.totalEmployees,
      total_net_amount: data.totalNetAmount,
      company_id: companyId,
    })
    .select("id")
    .single();

  if (!payrollData?.id || payrollError) {
    console.error("createSalaryPayroll payroll error", payrollError);
    return { status: payrollStatus, error: payrollError };
  }

  const finalPayrollFields = data.payrollFieldsData?.map((value) => ({
    ...value,
    payroll_id: payrollData.id,
  }));

  const {
    data: payrollFieldsData,
    status: payrollFieldsStatus,
    error: payrollFieldsError,
  } = await createPayrollFields({
    supabase,
    data: finalPayrollFields as unknown as PayrollFieldsDatabaseInsert[],
    onConflict: "name, payroll_id",
  });

  if (!payrollFieldsData || payrollFieldsError) {
    console.error("createPayrollFields payroll error", payrollFieldsError);
    return { status: payrollFieldsStatus, error: payrollFieldsError };
  }

  const salaryPayrollEntries = data.salaryEntryData?.map((value) => ({
    ...value,
    payroll_id: payrollData.id,
  }));

  const {
    data: salaryEntriesData,
    status: salaryEntriesStatus,
    error: salaryEntriesError,
  } = await createSalaryEntries({
    supabase,
    data: salaryPayrollEntries,
    onConflict: "monthly_attendance_id",
    bypassAuth,
  });

  if (!salaryEntriesData || salaryEntriesError) {
    console.error("createPayrollFields payroll error", salaryEntriesError);
    return { status: salaryEntriesStatus, error: salaryEntriesError };
  }

  const finalPayrollFieldEntries = [];

  const payrollFieldMap: { [key: string]: (typeof payrollFieldsData)[0] } = {};

  for (const field of payrollFieldsData) {
    const normalizedName = field.name.trim().toUpperCase();
    payrollFieldMap[normalizedName] = field;
  }

  for (const record of data.rawData) {
    const employeeId = record.employee_id;

    const salaryEntry = salaryEntriesData!.find(
      (entry) => entry.monthly_attendance?.employee_id === employeeId
    );

    if (!salaryEntry) continue;

    for (const [key, value] of Object.entries(record)) {
      const normalizedKey = key.trim().toUpperCase();
      const matchedField = payrollFieldMap[normalizedKey];

      if (
        matchedField &&
        value &&
        typeof value === "object" &&
        value !== null &&
        "amount" in value &&
        typeof (value as { amount?: unknown }).amount === "number"
      ) {
        finalPayrollFieldEntries.push({
          payroll_field_id: matchedField.id,
          amount: (value as { amount: number }).amount,
          salary_entry_id: salaryEntry.id,
        });
      }
    }
  }

  const { status: salaryFieldEntriesStatus, error: salaryFieldEntriesError } =
    await createSalaryFieldValues({
      supabase,
      data: finalPayrollFieldEntries,
      bypassAuth,
    });

  if (isGoodStatus(salaryFieldEntriesStatus)) {
    return {
      status: "success",
      message: "Payroll created successfully",
      error: null,
    };
  }

  return {
    status: payrollStatus ?? salaryEntriesStatus ?? salaryFieldEntriesStatus,
    error: payrollError ?? salaryEntriesError ?? salaryFieldEntriesError,
    message: null,
  };
}

export async function createSalaryPayrollByDepartment({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: {
    salaryData: Omit<SalaryEntriesDatabaseInsert, "payroll_id">[];
    totalEmployees: number;
    totalNetAmount: number;
    payrollId?: string;
    oldTotalEmployees: number;
    oldTotalNetAmount: number;
  };
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

  const { status: payrollStatus, error: payrollError } = await supabase
    .from("payroll")
    .update({
      total_employees: data.totalEmployees,
      total_net_amount: data.totalNetAmount,
    })
    .eq("id", data.payrollId!);

  if (payrollError) {
    await supabase
      .from("payroll")
      .update({
        total_employees: data.oldTotalEmployees,
        total_net_amount: data.oldTotalNetAmount,
      })
      .eq("id", data.payrollId!);
    console.error("createSalaryPayroll payroll error", payrollError);
    return { status: payrollStatus, error: payrollError };
  }

  const salaryPayrollEntries = data.salaryData?.map((value) => ({
    ...value,
    payroll_id: data.payrollId!,
  }));

  const {
    data: salaryEntriesData,
    status: salaryEntriesStatus,
    error: salaryEntriesError,
  } = await createSalaryEntries({
    supabase,
    data: salaryPayrollEntries,
    onConflict: "monthly_attendance_id",
    bypassAuth,
  });

  // if (isGoodStatus(salaryEntriesStatus)) {
  //   const uniqueEmployeeIds = new Set(
  //     salaryEntriesData?.map((entry) => entry?.employee_id)
  //   );
  //   const salaryEntriesEmployeeLength = uniqueEmployeeIds.size;

  //   const salaryEntriesNetAmount = calculateSalaryTotalNetAmount(
  //     salaryEntriesData!
  //   );
  //   if (salaryEntriesEmployeeLength === 0 || salaryEntriesNetAmount === 0) {
  //     return {
  //       status: "error",
  //       message: "No Unique Employees in Payroll Or Amount existed",
  //       error: "No entries created as no unique employee",
  //     };
  //   }
  //   if (
  //     data?.totalEmployees !== salaryEntriesEmployeeLength ||
  //     data?.totalNetAmount !== salaryEntriesNetAmount
  //   ) {
  //     const { status, error } = await updatePayroll({
  //       supabase,
  //       data: {
  //         id: data?.payrollId,
  //         total_employees:
  //           Number(data.oldTotalEmployees) + salaryEntriesEmployeeLength,
  //         total_net_amount:
  //           Number(data.oldTotalNetAmount) + salaryEntriesNetAmount,
  //       },
  //       bypassAuth,
  //     });
  //     if (isGoodStatus(status)) {
  //       return {
  //         status,
  //         message: `Skipped ${
  //           Number(data?.totalEmployees - data.oldTotalEmployees) -
  //           (salaryEntriesEmployeeLength ?? 0)
  //         } Employees cause they already exist in other payroll`,
  //         error,
  //       };
  //     }
  //   }
  // }

  return {
    status: payrollStatus ?? salaryEntriesStatus,
    error: payrollError ?? salaryEntriesError,
    message: null,
  };
}

export async function deletePayroll({
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
    .from("payroll")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deletePayroll Error:", error);
  }

  return { status, error };
}

export async function createSalaryEntries({
  supabase,
  data,
  onConflict,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: SalaryEntriesDatabaseInsert[];
  onConflict?: string;
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

  const {
    data: salaryEntriesData,
    status,
    error,
  } = await supabase
    .from("salary_entries")
    .upsert(data, {
      ignoreDuplicates: true,
      onConflict,
    })
    .select("id, monthly_attendance(employee_id)");

  if (error) {
    console.error("createSalaryEntries Error", error);
  }

  return { data: salaryEntriesData, status, error };
}

export async function deleteSalaryEntriesFromPayrollAndEmployeeId({
  supabase,
  payrollId,
  employeeId,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  payrollId: string;
  employeeId: string;
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

  const { data: salaryEntriesData } =
    await getSalaryEntriesByPayrollAndEmployeeId({
      supabase,
      employeeId,
      payrollId,
    });

  if (salaryEntriesData) {
    const { error, status } = await supabase
      .from("salary_entries")
      .delete()
      .in("id", [salaryEntriesData.salary_entries.id]);

    if (isGoodStatus(status)) {
      const { data: payrollData } = await getPayrollById({
        supabase,
        payrollId,
      });

      const totalNetAmountReduction =
        calculateNetAmountAfterEntryCreated(salaryEntriesData);

      await updatePayroll({
        supabase,
        data: {
          id: payrollData?.id,
          total_employees: payrollData?.total_employees! - 1,
          total_net_amount:
            payrollData?.total_net_amount! - totalNetAmountReduction,
        },
      });
    }

    if (error) {
      console.error(
        "deleteSalaryEntriesFromPayrollAndEmployeeId Error:",
        error
      );
    }

    return { status, error };
  }

  console.error(
    "deleteSalaryEntriesFromPayrollAndEmployeeId Error:",
    "No Salary Entries Found"
  );

  return { status: 404, error: "No Salary Entries Found" };
}

export async function updateSalaryEntry({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: SalaryEntriesDatabaseUpdate;
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

  const { data: salaryEntryData } = await getSalaryEntryById({
    supabase,
    id: data?.id ?? "",
  });

  const updateData = convertToNull(data);

  const { error, status } = await supabase
    .from("salary_entries")
    .update(updateData)
    .eq("id", data.id!);

  if (isGoodStatus(status)) {
    const { data: payrollData } = await getPayrollById({
      supabase,
      payrollId: data?.payroll_id ?? "",
    });

    let totalNetAmount = payrollData?.total_net_amount!;

    if (salaryEntryData?.type === "earning") {
      totalNetAmount -= salaryEntryData?.amount;
    } else if (salaryEntryData?.type === "deduction") {
      totalNetAmount += salaryEntryData?.amount;
    }

    if (updateData?.type === "earning") {
      totalNetAmount += updateData?.amount!;
    } else if (updateData?.type === "deduction") {
      totalNetAmount -= updateData?.amount!;
    }

    await updatePayroll({
      supabase,
      data: {
        id: payrollData?.id,
        total_net_amount: totalNetAmount,
      },
    });
  }

  if (error) {
    console.error("updatePayrollEntry Error:", error);
  }

  return { status, error };
}

export async function updatePayroll({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: PayrollDatabaseUpdate;
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
    .from("payroll")
    .update(updateData)
    .eq("id", data.id!)
    .select("id, status")
    .single();

  if (error) {
    console.error("updatePayroll Error:", error);
  }

  return { status, error };
}

//////////////////////////////////////////////////////////////////

export async function createPayroll({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: PayrollDatabaseInsert;
}) {
  const { error, status } = await supabase.from("payroll").insert(data);
  if (error) {
    console.error("createPayroll Error:", error);
  }

  return { status, error };
}

export async function updatePayrollById({
  payrollId,
  supabase,
  data,
}: {
  payrollId: string;
  supabase: TypedSupabaseClient;
  data: PayrollDatabaseUpdate;
}) {
  const { error, status } = await supabase
    .from("payroll")
    .update(data)
    .eq("id", payrollId ?? "")
    .single();

  if (error) {
    console.error("updatePayrollById Error:", error);
  }

  return { error, status };
}

export async function createPayrollFields({
  supabase,
  data,
  onConflict,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: PayrollFieldsDatabaseInsert[];
  onConflict?: string;
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

  const {
    data: payrollFieldData,
    status,
    error,
  } = await supabase
    .from("payroll_fields")
    .upsert(data, {
      ignoreDuplicates: true,
      onConflict,
    })
    .select("id, name");

  if (error) {
    console.error("createPayrollFields Error", error);
  }

  return { data: payrollFieldData, status, error };
}

export async function createSalaryFieldValues({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: SalaryFieldValuesDatabaseInsert[];
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

  const { status, error } = await supabase
    .from("salary_field_values")
    .upsert(data);

  if (error) {
    console.error("createSalaryFieldValues Error", error);
  }

  return { status, error };
}

export async function updateSalaryFieldValuesById({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: SalaryFieldValuesDatabaseUpdate;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return {
      status: 400,
      error: "No email found",
    };
  }

  const updateData = convertToNull(data);

  const { error, status } = await supabase
    .from("salary_field_values")
    .update(updateData)
    .eq("id", data.id ?? "")
    .single();

  if (error) console.error("updateSalaryFieldValuesById Error:", error);

  return { error, status };
}

export async function updatePayrollFieldsById({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: PayrollFieldsDatabaseUpdate;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return {
      status: 400,
      error: "No email found",
    };
  }

  const updateData = convertToNull(data);

  const { error, status } = await supabase
    .from("payroll_fields")
    .update(updateData)
    .eq("id", data.id ?? "")
    .single();

  if (error) console.error("updatePayrollFieldsById Error:", error);

  return { error, status };
}
