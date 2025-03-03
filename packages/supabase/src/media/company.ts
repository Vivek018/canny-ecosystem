import {
  SUPABASE_BUCKET,
  SUPABASE_STORAGE,
} from "@canny_ecosystem/utils/constant";
import type { TypedSupabaseClient } from "../types";
import { updateCompany } from "../mutations";

export async function uploadCompanyLogo({
  supabase,
  logo,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  logo: File;
  companyId: string;
}) {
  if (logo instanceof File) {
    const filePath = `${SUPABASE_STORAGE.LOGOS}/${companyId}`;
    const buffer = await logo.arrayBuffer();
    const fileData = new Uint8Array(buffer);

    // Storing company logo in bucket
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
      .update(filePath, fileData, {
        contentType: logo.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("uploadCompanyLogo Error", error);
      return { status: 500, error };
    }

    // Generating public URL for the uploaded logo
    const { data } = supabase.storage
      .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
      .getPublicUrl(filePath);

    // Setting company logo path in 'companies' table
    const { error: updateError } = await updateCompany({
      supabase,
      data: { id: companyId, logo: data.publicUrl },
    });

    if (updateError) {
      console.error("updateCompany Error", updateError);
      return { status: 500, error: updateError };
    }

    return { status: 200, error: null };
  }

  return { status: 400, error: "File not uploaded by the user" };
}

export async function deleteCompanyLogo({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const filePath = `${SUPABASE_STORAGE.LOGOS}/${companyId}`;
  const { error } = await supabase.storage
    .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
    .remove([filePath]);

  if (error) return { status: 500, error };
  return { status: 200, error };
}
