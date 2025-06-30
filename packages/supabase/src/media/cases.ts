import {
  getFilePathFromUrl,
  SUPABASE_BUCKET,
  SUPABASE_MEDIA_URL_PREFIX,
} from "@canny_ecosystem/utils/constant";
import { getCasesDocumentUrlByCompanyIdAndCaseTitle } from "../queries";
import type { CasesDatabaseInsert, TypedSupabaseClient } from "../types";
import { createCase, updateCaseById } from "../mutations";

export async function addOrUpdateCaseWithDocument({
  supabase,
  document,
  companyId,
  caseData,
  route,
}: {
  supabase: TypedSupabaseClient;
  document: File;
  companyId: string;
  caseData: CasesDatabaseInsert;
  route?: "add" | "update";
}) {
  if (document instanceof File) {
    const filePath = `cases/${companyId}/${caseData.title}`;

    const { data: existingData } =
      await getCasesDocumentUrlByCompanyIdAndCaseTitle({
        supabase,
        companyId,
        caseTitle: caseData.title!,
      });

    if (existingData?.document) {
      await deleteCaseDocument({
        supabase,
        companyId,
        caseTitle: caseData.title!,
      });
    }

    const buffer = await document.arrayBuffer();
    const fileData = new Uint8Array(buffer);

    const { data, error } = await supabase.storage
      .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
      .upload(filePath, fileData, {
        contentType: document.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("uploadCaseDocument Error", error);
      return { status: 500, error: error.message || "Error storing file" };
    }

    if (route === "add") {
      const { status: insertStatus, error: insertError } = await createCase({
        supabase,
        data: {
          ...caseData,
          document: `${SUPABASE_MEDIA_URL_PREFIX}${data.fullPath}`,
        },
      });

      if (insertError) {
        await supabase.storage
          .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
          .remove([filePath]);

        console.error("addCaseDocument Error", insertError);
        return {
          insertStatus,
          error: insertError || "Error uploading document record",
        };
      }

      return { status: insertStatus, error: null };
    }
    if (route === "update") {
      const { status: updateStatus, error: updateError } = await updateCaseById(
        {
          supabase,
          data: {
            ...caseData,
            document: `${SUPABASE_MEDIA_URL_PREFIX}${data.fullPath}`,
          },
        }
      );

      if (updateError) {
        console.error("updateCaseDocument Error", updateError);
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

export async function deleteCaseDocument({
  supabase,
  companyId,
  caseTitle,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
  caseTitle: string;
}) {
  const { data, error } = await getCasesDocumentUrlByCompanyIdAndCaseTitle({
    supabase,
    caseTitle,
    companyId,
  });

  if (!data || error) return { status: 400, error };

  const filePath = getFilePathFromUrl(data.document ?? "");

  const { error: bucketError } = await supabase.storage
    .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
    .remove([filePath]);

  if (bucketError) return { status: 500, error: bucketError };

  return { status: 200, error: null };
}
