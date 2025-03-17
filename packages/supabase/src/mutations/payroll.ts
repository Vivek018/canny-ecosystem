import type {
  PayrollDatabaseUpdate,
  PayrollEntriesDatabaseInsert,
  PayrollEntriesDatabaseUpdate,
  TypedSupabaseClient,
} from "../types";
import { getPayrollById, getPayrollEntryById, type ExitDataType, type ReimbursementDataType } from "../queries";
import { convertToNull, isGoodStatus } from "@canny_ecosystem/utils";

// Reimbrusement Payroll
export async function createReimbursementPayroll({ supabase, data, companyId, bypassAuth = false, }: {
  supabase: TypedSupabaseClient,
  data: {
    type: "reimbursement",
    reimbursementData: Pick<ReimbursementDataType, "id" | "employee_id" | "amount">[],
    totalEmployees: number,
    totalNetAmount: number
  }
  companyId: string,
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
  } = await supabase.from("payroll").insert({
    payroll_type: data.type ?? "reimbursement",
    status: "pending",
    total_employees: data.totalEmployees,
    total_net_amount: data.totalNetAmount,
    company_id: companyId
  }).select("id").single();

  if (!payrollData?.id || payrollError) {
    console.error("createReimbursmentPayroll payroll error", payrollError);
    return { status: payrollStatus, error: payrollError }
  }

  const reimbursementPayrollEntries = data.reimbursementData?.map((value) => ({
    payroll_id: payrollData.id,
    reimbursement_id: value.id,
    employee_id: value.employee_id,
    payment_status: "pending" as const,
    amount: value.amount,
  }))

  const { data: payrollEntriesData, status: payrollEntriesStatus, error: payrollEntriesError } = await createPayrollEntries({ supabase, data: reimbursementPayrollEntries, onConflict: "reimbursement_id" })

  if (isGoodStatus(payrollEntriesStatus)) {
    const payrollEntriesEmployeeLength = payrollEntriesData?.length;
    const payrollEntriesNetAmount = payrollEntriesData?.reduce(
      (sum, item) => sum + (item?.amount ?? 0),
      0,
    );

    if (data?.totalEmployees !== payrollEntriesEmployeeLength || data?.totalNetAmount !== payrollEntriesNetAmount) {
      const { status, error } = await updatePayroll({
        supabase, data: {
          id: payrollData?.id,
          total_employees: payrollEntriesEmployeeLength,
          total_net_amount: payrollEntriesNetAmount,
        }
      })
      if (isGoodStatus(status)) {
        return {
          status,
          message: `Skipped ${data?.totalEmployees - (payrollEntriesEmployeeLength ?? 0)} Employees cause they already exist in other payroll`,
          error
        }
      }
    }
  }

  return { status: payrollStatus ?? payrollEntriesStatus, error: payrollError ?? payrollEntriesError, message: null }
}

// Exit Payroll
export async function createExitPayroll({ supabase, data, companyId, bypassAuth = false, }: {
  supabase: TypedSupabaseClient,
  data: {
    type: "exit",
    exitData: Pick<ExitDataType, "id" | "employee_id" | "net_pay">[],
    totalEmployees: number,
    totalNetAmount: number
  }
  companyId: string,
  bypassAuth?: boolean;
}) {

  if (!bypassAuth) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) return { status: 400, error: "Unauthorized User" };
  }

  const {
    data: payrollData,
    status: payrollStatus,
    error: payrollError,
  } = await supabase.from("payroll").insert({
    payroll_type: data.type ?? "exit",
    status: "pending",
    total_employees: data.totalEmployees,
    total_net_amount: data.totalNetAmount,
    company_id: companyId
  }).select("id").single();

  if (!payrollData?.id || payrollError) {
    console.error("createExitPayroll payroll error", payrollError);
    return { status: payrollStatus, error: payrollError }
  }

  const exitPayrollEntries = data.exitData?.map((value) => ({
    payroll_id: payrollData.id,
    exit_id: value.id,
    employee_id: value.employee_id,
    payment_status: "pending" as const,
    amount: value.net_pay,
  }))

  const { data: payrollEntriesData, status: payrollEntriesStatus, error: payrollEntriesError } = await createPayrollEntries({ supabase, data: exitPayrollEntries, onConflict: "exit_id" })

  if (isGoodStatus(payrollEntriesStatus)) {
    const payrollEntriesEmployeeLength = payrollEntriesData?.length;
    const payrollEntriesNetAmount = payrollEntriesData?.reduce(
      (sum, item) => sum + (item?.amount ?? 0),
      0,
    );

    if (data?.totalEmployees !== payrollEntriesEmployeeLength || data?.totalNetAmount !== payrollEntriesNetAmount) {
      const { status, error } = await updatePayroll({
        supabase, data: {
          id: payrollData?.id,
          total_employees: payrollEntriesEmployeeLength,
          total_net_amount: payrollEntriesNetAmount,
        }
      })
      if (isGoodStatus(status)) {
        return {
          status,
          message: `Skipped ${data?.totalEmployees - (payrollEntriesEmployeeLength ?? 0)} Employees cause they already exist in other payroll`,
          error
        }
      }
    }
  }

  return { status: payrollStatus ?? payrollEntriesStatus, error: payrollError ?? payrollEntriesError, message: null }
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
    .eq("id", data.id!);

  if (error) {
    console.error("updatePayroll Error:", error);
  }

  return { status, error };
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

export async function createPayrollEntries({
  supabase,
  data,
  onConflict,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: PayrollEntriesDatabaseInsert[];
  onConflict?: string,
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
    data: payrollEntriesData,
    status,
    error,
  } = await supabase.from("payroll_entries").upsert(data, {
    ignoreDuplicates: true,
    onConflict
  }).select("id, amount");

  if (error) {
    console.error("createPayrollEntry Error", error);
  }

  return { data: payrollEntriesData, status, error };
}

export async function updatePayrollEntry({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: PayrollEntriesDatabaseUpdate;
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

  const { data: payrollEntryData } = await getPayrollEntryById({ supabase, id: data?.id ?? "" });

  const updateData = convertToNull(data);

  const { error, status } = await supabase
    .from("payroll_entries")
    .update(updateData)
    .eq("id", data.id!);

  if (isGoodStatus(status)) {
    const { data: payrollData } = await getPayrollById({ supabase, payrollId: data?.payroll_id ?? "" });

    await updatePayroll({
      supabase, data: {
        id: payrollData?.id,
        total_net_amount: payrollData?.total_net_amount! - payrollEntryData?.amount! + updateData?.amount!
      }
    })
  }

  if (error) {
    console.error("updatePayrollEntry Error:", error);
  }

  return { status, error };
}

export async function deletePayrollEntry({
  supabase,
  id,
  payrollId,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  id: string;
  payrollId: string;
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

  const { data: payrollEntryData } = await getPayrollEntryById({ supabase, id });

  const { error, status } = await supabase
    .from("payroll_entries")
    .delete()
    .eq("id", id);

  if (isGoodStatus(status)) {
    const { data: payrollData } = await getPayrollById({ supabase, payrollId });

    await updatePayroll({
      supabase, data: {
        id: payrollData?.id,
        total_employees: payrollData?.total_employees! - 1,
        total_net_amount: payrollData?.total_net_amount! - payrollEntryData?.amount!
      }
    })
  }

  if (error) {
    console.error("deletePayrollEntry Error:", error);
  }

  return { status, error };
}