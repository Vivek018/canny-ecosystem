import { convertToNull } from "@canny_ecosystem/utils";
import type { ExitsInsert, ExitsUpdate, TypedSupabaseClient } from "../types";
import type { ImportExitDataType } from "../queries";

export const createExit = async ({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: ExitsInsert;
  bypassAuth?: boolean;
}) => {
  if (!bypassAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      throw new Error("User is not logged in");
    }
  }

  const { error, status } = await supabase
    .from("exits")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("error", error);
  }

  return {
    status,
    error,
  };
};

export const updateExit = async ({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: ExitsUpdate;
  bypassAuth?: boolean;
}) => {
  if (!bypassAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return { status: 400, error: "Unauthorized User" };
  }

  const updateData = convertToNull(data);

  const { error, status } = await supabase
    .from("exits")
    .update(updateData)
    .eq("id", data.id!)
    .select()
    .single();

  if (error) console.error("error", error);

  return { status, error };
};

export const deleteExit = async ({
  supabase,
  id,
  bypassAuth = true,
}: {
  supabase: TypedSupabaseClient;
  id: string;
  bypassAuth?: boolean;
}) => {
  if (!bypassAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return { status: 400, error: "Unauthorized User" };
    }
  }

  const { error, status } = await supabase.from("exits").delete().eq("id", id);

  if (error) {
    console.error(error);
  }

  return {
    status,
    error,
  };
};

// export async function getExitsConflicts({
//   supabase,
//   importedData,
// }: {
//   supabase: TypedSupabaseClient;
//   importedData: ImportExitDataType[];
// }) {
//   const employeeCodes = [
//     ...new Set(importedData.map((emp) => emp.employee_code)),
//   ];
//   const primaryPhones = [
//     ...new Set(importedData.map((emp) => emp.primary_mobile_number)),
//   ];
//   const secondaryPhones = [
//     ...new Set(importedData.map((emp) => emp.secondary_mobile_number)),
//   ];
//   const emails = [...new Set(importedData.map((emp) => emp.personal_email))];

//   const query = supabase
//     .from("employees")
//     .select(
//       `
//       id,
//       employee_code,
//       primary_mobile_number,
//       secondary_mobile_number,
//       personal_email
//     `,
//     )
//     .or(
//       [
//         `employee_code.in.(${employeeCodes.map((code) => code).join(",")})`,
//         `primary_mobile_number.in.(${primaryPhones
//           .map((phone) => phone)
//           .join(",")})`,
//         `secondary_mobile_number.in.(${secondaryPhones
//           .map((phone) => phone)
//           .join(",")})`,
//         `personal_email.in.(${emails.map((email) => email).join(",")})`,
//       ].join(","),
//     );

//   const { data: conflictingRecords, error } = await query;

//   if (error) {
//     console.error("Error fetching conflicts:", error);
//     return { conflictingIndices: [], error };
//   }

//   const conflictingIndices = importedData.reduce(
//     (indices: number[], record, index) => {
//       const hasConflict = conflictingRecords?.some(
//         (existing) =>
//           existing.employee_code === record.employee_code ||
//           existing.primary_mobile_number === record.primary_mobile_number ||
//           existing.secondary_mobile_number === record.secondary_mobile_number ||
//           existing.personal_email === record.personal_email,
//       );

//       if (hasConflict) {
//         indices.push(index);
//       }
//       return indices;
//     },
//     [],
//   );

//   return { conflictingIndices, error: null };
// }

export async function createExitsFromImportedData({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: ExitsInsert[];
}) {
  const { error, status } = await supabase.from("exits").insert(data).select();

  if (error) console.error(error);

  return { status, error };
}
