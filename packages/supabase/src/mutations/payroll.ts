import type {
  ExitsInsert,
  PayrollDatabaseInsert,
  PayrollDatabaseUpdate,
  SalaryEntriesDatabaseInsert,
  SalaryEntriesDatabaseUpdate,
  TypedSupabaseClient,
} from "../types";
import {
  getPayrollById,
  getSalaryEntriesByPayrollAndEmployeeId,
  getSalaryEntryById,
  type ExitDataType,
  type ReimbursementDataType,
} from "../queries";
import {
  calculateSalaryTotalNetAmount,
  convertToNull,
  isGoodStatus,
} from "@canny_ecosystem/utils";
import {
  createReimbursementsFromImportedData,
  updateReimbursementsForPayrollCreation,
} from "./reimbursements";
import {
  createExitsFromImportedData,
  updateExitsForPayrollCreation,
} from "./exits";

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
    status?: "pending" | "approved" | "submitted";
    type: "salary";
    salaryData: Omit<SalaryEntriesDatabaseInsert, "payroll_id">[];
    totalEmployees: number;
    totalNetAmount: number;
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
      run_date: data.run_date ?? null,
      status: data?.status ?? "pending",
      payroll_type: data.type ?? "salary",
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

  const salaryPayrollEntries = data.salaryData?.map((value) => ({
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
    onConflict: "monthly_attendance_id, employee_id, field_name",
    bypassAuth,
  });

  if (isGoodStatus(salaryEntriesStatus)) {
    const uniqueEmployeeIds = new Set(
      salaryEntriesData?.map((entry) => entry?.employee_id)
    );
    const salaryEntriesEmployeeLength = uniqueEmployeeIds.size;

    const salaryEntriesNetAmount = calculateSalaryTotalNetAmount(
      salaryEntriesData!
    );

    if (salaryEntriesEmployeeLength === 0 || salaryEntriesNetAmount === 0) {
      const { status, error } = await deletePayroll({
        supabase,
        id: payrollData?.id ?? "",
        bypassAuth,
      });
      if (isGoodStatus(status)) {
        return {
          status,
          message:
            "Deleted Salary Payroll Cause No Unique Employees in Payroll Or Amount existed",
          error,
        };
      }
    } else if (
      data?.totalEmployees !== salaryEntriesEmployeeLength ||
      data?.totalNetAmount !== salaryEntriesNetAmount
    ) {
      const { status, error } = await updatePayroll({
        supabase,
        data: {
          id: payrollData?.id,
          total_employees: salaryEntriesEmployeeLength,
          total_net_amount: salaryEntriesNetAmount,
        },
        bypassAuth,
      });
      if (isGoodStatus(status)) {
        return {
          status,
          message: `Skipped ${
            data?.totalEmployees - (salaryEntriesEmployeeLength ?? 0)
          } Employees cause they already exist in other payroll`,
          error,
        };
      }
    }
  }

  return {
    status: payrollStatus ?? salaryEntriesStatus,
    error: payrollError ?? salaryEntriesError,
    message: null,
  };
}

// Reimbrusement Payroll
export async function createReimbursementPayroll({
  supabase,
  data,
  companyId,
  bypassAuth = false,
  from,
}: {
  supabase: TypedSupabaseClient;
  data: {
    run_date?: string;
    title: string;
    status?: "pending" | "approved" | "submitted";
    type: "reimbursement";
    reimbursementData: Partial<ReimbursementDataType>[];
    totalEmployees: number;
    totalNetAmount: number;
  };
  companyId: string;
  from?: string;
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
      run_date: data.run_date ?? null,
      status: data?.status ?? "pending",
      payroll_type: data.type ?? "reimbursement",
      total_employees: data.totalEmployees,
      total_net_amount: data.totalNetAmount,
      company_id: companyId,
    })
    .select("id")
    .single();

  if (!payrollData?.id || payrollError) {
    console.error("createReimbursmentPayroll payroll error", payrollError);
    return { status: payrollStatus, error: payrollError };
  }

  if (from === "import") {
    const updatedData = data.reimbursementData.map((entry) => ({
      ...entry,
      payroll_id: payrollData.id,
    }));

    const { error, status } = await createReimbursementsFromImportedData({
      data: updatedData,
      supabase,
    });

    return {
      status: payrollStatus ?? status,
      error: payrollError ?? error,
      message: null,
    };
  }

  const payrollEntriesData = data.reimbursementData.map(({ id }) => ({
    id: id!,
    payroll_id: payrollData?.id,
  }));

  const { errors, status } = await updateReimbursementsForPayrollCreation({
    data: payrollEntriesData,
    supabase,
  });

  return {
    status: payrollStatus ?? status,
    error: payrollError ?? errors,
    message: null,
  };
}

// Exit Payroll
export async function createExitPayroll({
  supabase,
  data,
  companyId,
  from,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: {
    run_date?: string;
    title: string;
    status?: "pending" | "approved" | "submitted";
    type: "exit";
    exitData: Partial<ExitDataType>[];
    totalEmployees: number;
    totalNetAmount: number;
  };
  from?: string;
  companyId: string;
  bypassAuth?: boolean;
}) {
  if (!bypassAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) return { status: 400, error: "Unauthorized User" };
  }

  const {
    data: payrollData,
    status: payrollStatus,
    error: payrollError,
  } = await supabase
    .from("payroll")
    .insert({
      title: data.title,
      run_date: data.run_date ?? null,
      status: data?.status ?? "pending",
      payroll_type: data.type ?? "exit",
      total_employees: data.totalEmployees,
      total_net_amount: data.totalNetAmount,
      company_id: companyId,
    })
    .select("id")
    .single();

  if (!payrollData?.id || payrollError) {
    console.error("createExitPayroll payroll error", payrollError);
    return { status: payrollStatus, error: payrollError };
  }
  if (from === "import") {
    const updatedData = data.exitData.map((entry) => ({
      ...entry,
      payroll_id: payrollData.id,
    }));

    const { error, status } = await createExitsFromImportedData({
      import_type: "skip",
      data: updatedData as ExitsInsert[],
      supabase,
    });

    return {
      status: payrollStatus ?? status,
      error: payrollError ?? error,
      message: null,
    };
  }

  const exitEntriesData = data.exitData.map(({ id }) => ({
    id: id!,
    payroll_id: payrollData?.id,
  }));

  const { errors, status } = await updateExitsForPayrollCreation({
    data: exitEntriesData,
    supabase,
  });
  return {
    status: payrollStatus ?? status,
    error: payrollError ?? errors,
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
    .select("id, amount, type, employee_id");

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
      .in(
        "id",
        salaryEntriesData.salary_entries.map((entry) => entry.id)
      );

    if (isGoodStatus(status)) {
      const { data: payrollData } = await getPayrollById({
        supabase,
        payrollId,
      });

      const totalNetAmountReduction = calculateSalaryTotalNetAmount(
        salaryEntriesData.salary_entries
      );

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
    } else if (
      salaryEntryData?.type === "deduction" ||
      salaryEntryData?.type === "statutory_contribution"
    ) {
      totalNetAmount += salaryEntryData?.amount;
    }

    if (updateData?.type === "earning") {
      totalNetAmount += updateData?.amount!;
    } else if (
      updateData?.type === "deduction" ||
      updateData?.type === "statutory_contribution"
    ) {
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
