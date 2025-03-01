import {
  SUPABASE_BUCKET,
  SUPABASE_STORAGE,
} from "@canny_ecosystem/utils/constant";
import type { TypedSupabaseClient } from "../types";

export async function getCompanyLogoByCompanyId({
  supabase,
  companyId,
}: { supabase: TypedSupabaseClient; companyId: string }) {
  const { data, error } = await supabase.storage
    .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
    .createSignedUrl(`${SUPABASE_STORAGE.LOGOS}/${companyId}`, 60 * 60);

  if (error) {
    console.error("getRelationshipTermsById Error", error);
    return { data, error };
  }
  return { data, error };
}

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

    return { status: 200, error };
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
