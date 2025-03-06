import type {
  PayrollDatabaseUpdate,
  PayrollEntriesDatabaseInsert,
  TypedSupabaseClient,
} from "../types";
import type { ReimbursementDataType } from "../queries";
import { convertToNull, isGoodStatus } from "@canny_ecosystem/utils";


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
      updatePayroll({
        supabase, data: {
          id: payrollData?.id,
          total_employees: payrollEntriesEmployeeLength,
          total_net_amount: payrollEntriesNetAmount,
        }
      })
    }
  }

  return { status: payrollStatus ?? payrollEntriesStatus, error: payrollError ?? payrollEntriesError }
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
    .select()
    .single();

  if (error) {
    console.error("updateProject Error:", error);
  }

  return { status, error };
}
