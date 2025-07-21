import type {
  InvoiceDatabaseInsert,
  InvoiceDatabaseUpdate,
  TypedSupabaseClient,
} from "../types";

export async function createInvoice({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: InvoiceDatabaseInsert;
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

  const newData = {
    ...data,
    payroll_data: JSON.parse(data.payroll_data as any),
  };

  const {
    data: returnedData,
    error,
    status,
  } = await supabase.from("invoice").insert(newData).select().single();
  
  if (error) {
    console.error("createInvoice Error:", error);
  }

  return { data: returnedData, status, error };
}

export async function updateInvoiceById({
  invoiceId,
  supabase,
  data,
}: {
  invoiceId: string;
  supabase: TypedSupabaseClient;
  data: InvoiceDatabaseUpdate;
}) {
  const newData = {
    ...data,
    payroll_data: JSON.parse(data.payroll_data as any),
  };
  const { error, status } = await supabase
    .from("invoice")
    .update(newData)
    .eq("id", invoiceId ?? "")
    .single();

  if (error) {
    console.error("updateInvoiceById Error:", error);
  }

  return { error, status };
}

export async function deleteInvoiceById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const { error, status } = await supabase
    .from("invoice")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteInvoiceById Error:", error);
    return { status, error };
  }

  if (status < 200 || status >= 300) {
    console.error("deleteInvoiceById Unexpected Supabase status:", status);
  }

  return { status, error: null };
}
