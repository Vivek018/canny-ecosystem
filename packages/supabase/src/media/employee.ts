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
import { convertToNull, type employeeDocuments } from "@canny_ecosystem/utils";

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

    // Storing file in bucket
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

    // Generating the public URL
    const { data } = supabase.storage
      .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
      .getPublicUrl(filePath);

    // Updating photo path in employees
    const { error: updateEmployeeError } = await updateEmployee({
      supabase,
      data: { id: employeeId, photo: data.publicUrl },
    });

    if (updateEmployeeError) {
      console.error("updateEmployee Error", updateEmployeeError);
      return { status: 500, error: updateEmployeeError };
    }

    return { status: 200 };
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
  const columns = ["document_type", "url"] as const;

  const { data, error } = await supabase
    .from("employee_documents")
    .select(columns.join(","))
    .eq("employee_id", employeeId)
    .returns<EmployeeDocumentsDatabaseRow[]>();

  if (error) {
    console.error("getEmployeeDocuments Error", error);
    return null;
  }

  return { data, error };
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
  documentName: (typeof employeeDocuments)[number];
}) {
  const columns = ["id"] as const;
  const { data: documentData } = await supabase
    .from("employee_documents")
    .select(columns.join(","))
    .eq("employee_id", employeeId)
    .eq("document_type", documentName)
    .single<
      InferredType<
        Omit<
          EmployeeDocumentsDatabaseRow,
          "updated_at" | "created_at" | "employee_id"
        >,
        (typeof columns)[number]
      >
    >();

  // document already exists!
  if (documentData) return { status: 403, error: "Document already exists" };

  if (file instanceof File) {
    const filePath = `employees/${documentName}/${employeeId}`;
    const buffer = await file.arrayBuffer();
    const fileData = new Uint8Array(buffer);

    // Storing file in Supabase storage
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

    // Generating the public URL for the uploaded document
    const { data } = supabase.storage
      .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
      .getPublicUrl(filePath);

    // Updating the path in employee_documents table
    const dataToBeInserted = convertToNull({
      employee_id: employeeId,
      document_type: documentName,
      url: data.publicUrl,
    });

    const { error: insertError } = await supabase
      .from("employee_documents")
      .insert(dataToBeInserted)
      .select()
      .single();

    if (insertError) {
      console.error("uploadEmployeeDocument Error", insertError);
      return {
        status: 500,
        error: insertError.message || "Error uploading document record",
      };
    }

    return { status: 200, error: null };
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
  await deleteEmployeeDocument({ supabase, documentName, employeeId });
  const { error } = await uploadEmployeeDocument({
    supabase,
    file,
    employeeId,
    documentName,
  });
  if (!error) return { status: 200, error: null };

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
  // deleting from bucket
  const filePath = `employees/${documentName}/${employeeId}`;
  const { error: bucketError } = await supabase.storage
    .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
    .remove([filePath]);
  if (bucketError) return { status: 500, error: bucketError };

  // deleting entry from table
  const { error: deleteError } = await supabase
    .from("employee_documents")
    .delete()
    .eq("employee_id", employeeId)
    .eq("document_type", documentName);

  if (deleteError) return { status: 500, error: deleteError };
  return { status: 200, error: null };
}
