import {
  getFilePathFromUrl,
  SUPABASE_BUCKET,
  SUPABASE_MEDIA_URL_PREFIX,
  SUPABASE_STORAGE,
} from "@canny_ecosystem/utils/constant";
import type { TypedSupabaseClient } from "../types";
import {
  addCompanyDocument,
  deleteCompanyDocumentByCompanyId,
  updateCompany,
} from "../mutations";
import { isGoodStatus } from "@canny_ecosystem/utils";
import {
  getCompanyById,
  getCompanyDocumentUrlByCompanyIdAndDocumentName,
} from "../queries";

// Company Logo
export async function uploadCompanyLogo({
  supabase,
  logo,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  logo: File;
  companyId: string;
}) {
  const { status, error } = await deleteCompanyLogo({ supabase, companyId });
  if (!isGoodStatus(status)) {
    console.error("deleteCompanyLogo Error", error);
    return { status, error };
  }

  if (logo instanceof File) {
    const filePath = `${SUPABASE_STORAGE.LOGOS}/${companyId}${logo.name}`;
    const buffer = await logo.arrayBuffer();
    const fileData = new Uint8Array(buffer);

    // Storing company logo in bucket
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
      .upload(filePath, fileData, {
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
  const { data } = await getCompanyById({ supabase, id: companyId });
  const filePath = getFilePathFromUrl(data?.logo ?? "");

  // deleting from bucket
  const { error } = await supabase.storage
    .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
    .remove([filePath]);

  // setting logo=NULL in companies table
  const { error: updateError } = await updateCompany({
    supabase,
    data: { id: companyId, logo: null },
  });
  if (updateError) {
    console.error("updateCompany Error", updateError);
    return { status: 500, error: updateError };
  }

  if (error) return { status: 500, error };
  return { status: 200, error };
}

// Company Documents
export async function uploadCompanyDocument({
  supabase,
  file,
  companyId,
  documentName,
}: {
  supabase: TypedSupabaseClient;
  file: File;
  companyId: string;
  documentName: string;
}) {
  if (file instanceof File) {
    const filePath = `company/${companyId}/${documentName}`;
    const { data: existingData } =
      await getCompanyDocumentUrlByCompanyIdAndDocumentName({
        supabase,
        companyId,
        documentName,
      });
    if (existingData) return { status: 400, error: "Document already exists" };

    const buffer = await file.arrayBuffer();
    const fileData = new Uint8Array(buffer);

    const { data, error } = await supabase.storage
      .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
      .upload(filePath, fileData, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("uploadCompanyDocument Error", error);
      return { status: 500, error: error.message || "Error storing file" };
    }

    const { status, error: insertError } = await addCompanyDocument({
      supabase,
      companyId,
      documentName,
      url: `${SUPABASE_MEDIA_URL_PREFIX}${data.fullPath}`,
    });

    if (insertError) {
      console.error("addCompanyDocument Error", insertError);
      return {
        status,
        error: insertError.message || "Error uploading document record",
      };
    }

    return { status, error: null };
  }

  return { status: 400, error: "File not uploaded by the user" };
}

export async function updateCompanyDocument({
  supabase,
  file,
  companyId,
  documentName,
  existingDocumentName,
}: {
  supabase: TypedSupabaseClient;
  file: File;
  companyId: string;
  documentName: string;
  existingDocumentName: string;
}) {
  const { status } = await deleteCompanyDocument({
    supabase,
    documentName: existingDocumentName,
    companyId,
  });

  if (isGoodStatus(status)) {
    const { status, error } = await uploadCompanyDocument({
      companyId,
      documentName,
      file,
      supabase,
    });

    if (isGoodStatus(status)) return { status, error };
  }

  return { status, error: "File not uploaded by the user" };
}

export async function deleteCompanyDocument({
  supabase,
  companyId,
  documentName,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
  documentName: string;
}) {
  const { data, error } = await getCompanyDocumentUrlByCompanyIdAndDocumentName(
    {
      supabase,
      documentName,
      companyId,
    }
  );
  if (!data || error) return { status: 400, error };

  const filePath = getFilePathFromUrl(data.url ?? "");
  const { error: bucketError } = await supabase.storage
    .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
    .remove([filePath]);

  if (bucketError) return { status: 500, error: bucketError };

  const { error: deleteCompanyDocumentError, status } =
    await deleteCompanyDocumentByCompanyId({
      supabase,
      documentName,
      companyId,
    });

  if (deleteCompanyDocumentError)
    console.error(
      "deleteCompanyDocumentByCompanyId error",
      deleteCompanyDocumentError
    );
  return { status, error: null };
}
