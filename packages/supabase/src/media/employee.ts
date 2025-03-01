import {
  SUPABASE_BUCKET,
  SUPABASE_STORAGE,
} from "@canny_ecosystem/utils/constant";
import type {
  EmployeeDocumentsDatabaseRow,
  InferredType,
  TypedSupabaseClient,
} from "../types";
import { updateEmployee } from "../mutations";
import { getEmployeeById } from "../queries";
import { convertToNull } from "@canny_ecosystem/utils";

// employee profile photo
export async function getEmployeeProfilePhotoByEmployeeId({
  supabase,
  employeeId,
}: { supabase: TypedSupabaseClient; employeeId: string }) {
  const { data: employeeData, error: employeeError } = await getEmployeeById({
    supabase,
    id: employeeId,
  });

  if (employeeError || !employeeData?.photo) {
    console.error("getEmployeeById Error", employeeError);
    return { data: employeeData, error: employeeError };
  }

  const { data, error } = await supabase.storage
    .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
    .createSignedUrl(employeeData?.photo, 60 * 60);

  if (error) {
    console.error("getEmployeeProfilePhotoByEmployeeId Error", error);
    return { data, error };
  }
  return { data, error };
}

export async function uploadEmployeeProfilePhoto({
  supabase,
  profilePhoto,
  employeeId,
}: {
  supabase: TypedSupabaseClient;
  profilePhoto: any;
  employeeId: string;
}) {
  if (profilePhoto instanceof File) {
    const filePath = `${SUPABASE_STORAGE.EMPLOYEE_PROFILE_PHOTO}/${employeeId}`;
    const buffer = await profilePhoto.arrayBuffer();
    const fileData = new Uint8Array(buffer);
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
      .update(filePath, fileData, {
        contentType: profilePhoto.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("uploadEmployeeProfilePhoto Error", error);
      return { status: 500, error };
    }

    const { error: updateEmployeeError } = await updateEmployee({
      supabase,
      data: { id: employeeId, photo: filePath },
    });

    if (updateEmployeeError) {
      console.error("updateEmployee Error", updateEmployeeError);
      return { status: 500, error: updateEmployeeError };
    }

    return { status: 200, error };
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

  if (error) return { status: 500, error };
  return { status: 200, error };
}

// documents
export async function getEmployeeDocuments({
  supabase,
  employeeId,
}: { supabase: TypedSupabaseClient; employeeId: string }) {
  const columns = [
    "aadhaar_card",
    "address_proof",
    "bank_document",
    "birth_certificate",
    "cv",
    "driving_license",
    "guardian_document",
    "marriage_certificate",
    "pan_card",
    "passport",
    "uan_card",
  ] as const;

  const { data, error } = await supabase
    .from("employee_documents")
    .select(columns.join(","))
    .eq("employee_id", employeeId)
    .single<
      InferredType<EmployeeDocumentsDatabaseRow, (typeof columns)[number]>
    >();

  if (error) {
    console.error("getEmployeeDocuments Error", error);
    return null;
  }

  const entriesWithPaths = Object.entries(data).filter(
    ([_, path]) => path !== null,
  );

  const signedUrls = await Promise.all(
    entriesWithPaths.map(async ([key, path]) => {
      const { data: urlData, error: urlError } = await supabase.storage
        .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
        .createSignedUrl(path as string, 60 * 60);

      if (!urlError) return { name: key, url: urlData.signedUrl };
    }),
  );

  return { data: signedUrls, error };
}

export async function uploadEmployeeDocument({
  supabase,
  file,
  employeeId,
  documentName,
}: {
  supabase: TypedSupabaseClient;
  file: File;
  employeeId: string;
  documentName: string;
}) {
  if (file instanceof File) {
    const filePath = `employees/${documentName}/${employeeId}`;
    const buffer = await file.arrayBuffer();
    const fileData = new Uint8Array(buffer);

    // updating path in employee_documents table
    const updatedData = convertToNull({
      employee_id: employeeId,
      [documentName]: filePath,
    });

    const { error: updateError } = await supabase
      .from("employee_documents")
      .upsert(updatedData)
      .eq("employee_id", employeeId)
      .select()
      .single();

    if (updateError) {
      console.error("uploadEmployeeDocument Error", updateError);
      return {
        status: 500,
        error: updateError.message || "Error updating document record",
      };
    }

    // storing file in supabase
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
      .update(filePath, fileData, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("uploadEmployeeDocument Error", error);
      return { status: 500, error: error.message || "Error storing file" };
    }

    return { status: 200, error: null };
  }
  return { status: 400, error: "File not uploaded by the user" };
}

export async function deleteEmployeeDocument({
  supabase,
  employeeId,
  documentName,
}: {
  supabase: TypedSupabaseClient;
  employeeId: string;
  documentName: string;
}) {
  const columns = [documentName] as any;

  // getting filePath
  const { data, error } = await supabase
    .from("employee_documents")
    .select(columns.join(","))
    .eq("employee_id", employeeId)
    .single<
      InferredType<
        Omit<EmployeeDocumentsDatabaseRow, "created_at" | "updated_at">,
        (typeof columns)[number]
      >
    >();
  if (error) return { status: 500, error };

  // deleting from bucket
  const { error: bucketError } = await supabase.storage
    .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
    .remove([data[documentName] as string]);
  if (bucketError) return { status: 500, error: bucketError };

  // updating filePath
  const { error: updateError } = await supabase
    .from("employee_documents")
    .update({ [documentName]: null })
    .eq("employee_id", employeeId)
    .select()
    .single();

  if (updateError) return { status: 500, error: updateError };
  return { status: 200, error };
}
