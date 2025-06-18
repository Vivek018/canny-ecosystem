import { getPayrollById, getReimbursementsById } from "../queries";
import type {
  ReimbursementInsert,
  ReimbursementsUpdate,
  TypedSupabaseClient,
} from "../types";
import { updatePayroll } from "./payroll";

export async function createReimbursementsFromData({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: ReimbursementInsert[];
}) {
  const { error, status } = await supabase.from("reimbursements").insert(data);
  if (error) {
    console.error("createReimbursementsFromData Error:", error);
  }

  return { status, error };
}

export async function createReimbursementsFromImportedData({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: ReimbursementInsert[];
}) {
  const { error, status } = await supabase
    .from("reimbursements")
    .insert(data)
    .select();

  if (error) {
    console.error("createReimbursementsFromImportedData Error:", error);
  }

  return { status, error };
}

export async function updateReimbursementsById({
  reimbursementId,
  supabase,
  data,
}: {
  reimbursementId: string;
  supabase: TypedSupabaseClient;
  data: ReimbursementsUpdate;
}) {
  const { error, status } = await supabase
    .from("reimbursements")
    .update(data)
    .eq("id", reimbursementId ?? "")
    .single();

  if (error) {
    console.error("updateReimbursementsById Error:", error);
  }

  return { error, status };
}

export async function deleteReimbursementById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const { error, status } = await supabase
    .from("reimbursements")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteReimbursementById Error:", error);
    return { status, error };
  }

  if (status < 200 || status >= 300) {
    console.error(
      "deleteReimbursementById Unexpected Supabase status:",
      status
    );
  }

  return { status, error: null };
}

export async function updateReimbursementsForPayrollCreation({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: { id: string; payroll_id: string }[];
}) {
  const results = await Promise.all(
    data.map((item) => {
      const { id, ...updateData } = item;
      return supabase.from("reimbursements").update(updateData).eq("id", id!);
    })
  );

  const errors = results.filter((res) => res.error);
  const status = results.filter((res) => res.status);

  return { status, errors };
}

export async function updateReimbursementsAndPayrollById({
  reimbursementId,
  supabase,
  data: updatedData,
  action,
}: {
  reimbursementId: string;
  supabase: TypedSupabaseClient;
  data: ReimbursementsUpdate;
  action: string;
}) {
  const { data: entryData } = await getReimbursementsById({
    supabase,
    reimbursementId: reimbursementId ?? "",
  });

  const { data: payrollData } = await getPayrollById({
    supabase,
    payrollId: entryData?.payroll_id ?? "",
  });

  let totalNetAmount = payrollData?.total_net_amount!;
  let totalEmployees = payrollData?.total_employees!;
  if (action === "update") {
    totalNetAmount -= entryData?.amount!;
    totalNetAmount += updatedData?.amount!;
  } else if (action === "delete") {
    totalNetAmount -= entryData?.amount!;
    totalEmployees -= 1;
  }

  await updatePayroll({
    supabase,
    data: {
      id: payrollData?.id,
      total_net_amount: totalNetAmount,
      total_employees: totalEmployees,
    },
  });

  const { error, status } = await supabase
    .from("reimbursements")
    .update(updatedData)
    .eq("id", reimbursementId ?? "")
    .single();

  if (error) {
    console.error("updateReimbursementsAndPayrollById Error:", error);
  }

  return { error, status };
}
