import {
  getFilePathFromUrl,
  SUPABASE_BUCKET,
  SUPABASE_MEDIA_URL_PREFIX,
} from "@canny_ecosystem/utils/constant";
import { createInvoice, updateInvoiceById } from "../mutations";
import { getInvoiceProofUrlByPayrollIdAndDocumentName } from "../queries";
import type { InvoiceDatabaseInsert, TypedSupabaseClient } from "../types";

export async function addOrUpdateInvoiceWithProof({
  supabase,
  proof,
  invoiceData,
  route,
}: {
  supabase: TypedSupabaseClient;
  proof: File;
  invoiceData: InvoiceDatabaseInsert;
  route?: "add" | "update";
}) {
  if (proof instanceof File) {
    const filePath = `invoice/${invoiceData.invoice_number}`;

    const { data: existingData } =
      await getInvoiceProofUrlByPayrollIdAndDocumentName({
        supabase,
        documentName: invoiceData.invoice_number!,
      });

    if (existingData?.proof) {
      await deleteInvoiceProof({
        supabase,
        documentName: invoiceData.invoice_number!,
      });
    }

    const buffer = await proof.arrayBuffer();
    const fileData = new Uint8Array(buffer);

    const { data, error } = await supabase.storage
      .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
      .upload(filePath, fileData, {
        contentType: proof.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("uploadInvoiceDocument Error", error);
      return { status: 500, error: error.message || "Error storing file" };
    }

    if (route === "add") {
      const { status: insertStatus, error: insertError } = await createInvoice({
        supabase,
        data: {
          ...invoiceData,
          proof: `${SUPABASE_MEDIA_URL_PREFIX}${data.fullPath}`,
        },
      });

      if (insertError) {
        await supabase.storage
          .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
          .remove([filePath]);
        console.error("addInvoiceProof Error", insertError);
        return {
          insertStatus,
          error: insertError || "Error uploading document record",
        };
      }

      return { status: insertStatus, error: null };
    }
    if (route === "update") {
      const { status: updateStatus, error: updateError } =
        await updateInvoiceById({
          supabase,
          data: {
            ...invoiceData,
            proof: `${SUPABASE_MEDIA_URL_PREFIX}${data.fullPath}`,
          },
          invoiceId: invoiceData.id!,
        });

      if (updateError) {
        console.error("updateInvoiceProof Error", updateError);
        return {
          updateStatus,
          error: updateError || "Error uploading document record",
        };
      }

      return { status: updateStatus, error: null };
    }
  }

  return { status: 400, error: "File not uploaded by the user" };
}

export async function deleteInvoiceProof({
  supabase,
  documentName,
}: {
  supabase: TypedSupabaseClient;
  documentName: string;
}) {
  const { data, error } = await getInvoiceProofUrlByPayrollIdAndDocumentName({
    supabase,
    documentName,
  });
  if (!data || error) return { status: 400, error };

  const filePath = getFilePathFromUrl(data.proof ?? "");

  const { error: bucketError } = await supabase.storage
    .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
    .remove([filePath]);

  if (bucketError) return { status: 500, error: bucketError };

  return { status: 200, error: null };
}
