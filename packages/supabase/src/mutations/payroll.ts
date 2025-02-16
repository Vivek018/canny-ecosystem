import { convertToNull } from "@canny_ecosystem/utils";
import type {
  PayrollDatabaseInsert,
  PayrollEntriesDatabaseRow,
  TypedSupabaseClient,
} from "../types";

export async function createPayroll({
  supabase,
  data,
}: { supabase: TypedSupabaseClient; data: PayrollDatabaseInsert }) {
  const {
    data: payrollData,
    status,
    error,
  } = await supabase.from("payroll").insert(data).select().single();

  if (error) console.error("createPayroll Error", error);

  return { data: payrollData, status, error };
}

export async function createPayrollEntry({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: PayrollEntriesDatabaseRow;
}) {
  const {
    data: payrollEntryData,
    status,
    error,
  } = await supabase.from("payroll_entries").insert(data).select().single();

  if (error) console.error("createPayrollEntry Error", error);

  return { data: payrollEntryData, status, error };
}

export async function updatePayrollEntryByEmployeeIdAndPayrollIdAndPaymentTemplateComponentId({
  supabase,
  data,
  employeeId,
  payrollId,
  paymentTemplateComponentId,
}: {
  supabase: TypedSupabaseClient;
  data: any;
  employeeId: string;
  payrollId: string;
  paymentTemplateComponentId: string;
}) {
  const updateData = convertToNull(data);

  const { error, status } = await supabase
    .from("payroll_entries")
    .update(updateData)
    .eq("employee_id", employeeId)
    .eq("payroll_id", payrollId)
    .eq("payment_template_components_id", paymentTemplateComponentId)
    .select()
    .single();

  if (error)
    console.error(
      "updatePayrollEntryByEmployeeIdAndPayrollIdAndPaymentTemplateComponentId Error",
      error,
    );

  return { status, error };
}

export async function approvePayrollById({
  supabase,
  payrollId,
}: {
  supabase: TypedSupabaseClient;
  payrollId: string;
}) {
  const { error, status } = await supabase
    .from("payroll")
    .update({ status: "approved" })
    .eq("id", payrollId)
    .select()
    .single();

  if (error) console.error("approvePayrollById Error", error);

  return { status, error };
}
