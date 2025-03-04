import {
  getFilePathFromUrl,
  SUPABASE_BUCKET,
  SUPABASE_MEDIA_URL_PREFIX,
  SUPABASE_STORAGE,
} from "@canny_ecosystem/utils/constant";
import type { TypedSupabaseClient } from "../types";
import {
  addEmployeeDocument,
  deleteEmployeeDocumentByEmployeeId,
  updateEmployee,
} from "../mutations";
import { isGoodStatus, type employeeDocuments } from "@canny_ecosystem/utils";
import { getEmployeeDocumentUrlByEmployeeIdAndDocumentName } from "../queries";

// employee profile photo
export async function uploadEmployeeProfilePhoto({
  supabase,
  profilePhoto,
  employeeId,
}: {
  supabase: TypedSupabaseClient;
  profilePhoto: File;
  employeeId: string;
}) {
  if (profilePhoto instanceof File) {
    const filePath = `${SUPABASE_STORAGE.EMPLOYEE_PROFILE_PHOTO}/${employeeId}`;
    const buffer = await profilePhoto.arrayBuffer();
    const fileData = new Uint8Array(buffer);

    const { data, error } = await supabase.storage
      .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
      .upload(filePath, fileData, {
        contentType: profilePhoto.type,
        cacheControl: "0",
        upsert: false,
      });

    if (error) {
      console.error("uploadEmployeeProfilePhoto Error", error);
      return { status: 500, error };
    }

    const { status, error: updateEmployeeError } = await updateEmployee({
      supabase,
      data: {
        id: employeeId,
        photo: `${SUPABASE_MEDIA_URL_PREFIX}${data.fullPath}`,
      },
    });

    if (updateEmployeeError) {
      console.error("updateEmployee Error", updateEmployeeError);
      return { status, error: updateEmployeeError };
    }

    return { status, error: null };
  }

  return { status: 400, error: "File not uploaded by the user" };
}

export async function deleteEmployeeProfilePhoto({
  supabase,
  employeeId,
}: {
  supabase: TypedSupabaseClient;
  employeeId: string;
}) {
  const filePath = `${SUPABASE_STORAGE.EMPLOYEE_PROFILE_PHOTO}/${employeeId}`;
  const { error } = await supabase.storage
    .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
    .remove([filePath]);

  if (error) {
    console.error("deleteEmployeeProfilePhoto error", error);
  }
  return { status: 200, error };
}

// employee documents
export async function uploadEmployeeDocument({
  supabase,
  file,
  employeeId,
  documentName,
}: {
  supabase: TypedSupabaseClient;
  file: File;
  employeeId: string;
  documentName: (typeof employeeDocuments)[number];
}) {
  if (file instanceof File) {
    const filePath = `employees/${documentName}/${employeeId}${file.name}`;
    const { data: documentData } =
      await getEmployeeDocumentUrlByEmployeeIdAndDocumentName({
        supabase,
        documentName,
        employeeId,
      });

    if (
      (documentData?.url ?? "").includes(
        `employees/${documentName}/${employeeId}`,
      )
    )
      return { status: 400, error: "File already exists" };

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
      console.error("uploadEmployeeDocument Error", error);
      return { status: 500, error: error.message || "Error storing file" };
    }

    const { status, error: insertError } = await addEmployeeDocument({
      supabase,
      employee_id: employeeId,
      document_type: documentName,
      url: `${SUPABASE_MEDIA_URL_PREFIX}${data.fullPath}`,
    });

    if (insertError) {
      console.error("uploadEmployeeDocument Error", insertError);
      return {
        status,
        error: insertError.message || "Error uploading document record",
      };
    }

    return { status, error: null };
  }

  return { status: 400, error: "File not uploaded by the user" };
}

export async function updateEmployeeDocument({
  supabase,
  file,
  employeeId,
  documentName,
}: {
  supabase: TypedSupabaseClient;
  file: File;
  employeeId: string;
  documentName: (typeof employeeDocuments)[number];
}) {
  const { status } = await deleteEmployeeDocument({
    supabase,
    documentName,
    employeeId,
  });

  if (isGoodStatus(status)) {
    return await uploadEmployeeDocument({
      supabase,
      employeeId,
      file,
      documentName,
    });
  }

  return { status, error: "File not uploaded by the user" };
}

export async function deleteEmployeeDocument({
  supabase,
  employeeId,
  documentName,
}: {
  supabase: TypedSupabaseClient;
  employeeId: string;
  documentName: (typeof employeeDocuments)[number];
}) {
  const { data, error } =
    await getEmployeeDocumentUrlByEmployeeIdAndDocumentName({
      supabase,
      documentName,
      employeeId,
    });
  if (!data || error) return { status: 400, error };

  const filePath = getFilePathFromUrl(data.url ?? "");
  const { error: bucketError } = await supabase.storage
    .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
    .remove([filePath]);

  if (bucketError) return { status: 500, error: bucketError };

  const { error: deleteEmployeeDocumentError, status } =
    await deleteEmployeeDocumentByEmployeeId({
      supabase,
      documentName,
      employeeId,
    });

  if (deleteEmployeeDocumentError)
    console.error(
      "deleteEmployeeDocumentByEmployeeId error",
      deleteEmployeeDocumentError,
    );
  return { status, error: null };
}
