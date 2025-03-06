import type {
  PayrollEntriesDatabaseInsert,
  TypedSupabaseClient,
} from "../types";
import type { ReimbursementDataType } from "../queries";


export async function createReimbursementPayroll({ supabase, data, bypassAuth = false, }: {
  supabase: TypedSupabaseClient,
  data: {
    type: "reimbursement",
    reimbursementData: Pick<ReimbursementDataType, "id" | "employee_id" | "amount">[]
  }
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
    status: "pending"
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

  const { status: payrollEntriesStatus, error: payrollEntriesError } = await createPayrollEntries({ supabase, data: reimbursementPayrollEntries })

  return { status: payrollStatus ?? payrollEntriesStatus, error: payrollError ?? payrollEntriesError }
}

export async function createPayrollEntries({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: PayrollEntriesDatabaseInsert[];
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
    status,
    error,
  } = await supabase.from("payroll_entries").insert(data);

  if (error) {
    console.error("createPayrollEntry Error", error);
  }

  return { status, error };
}