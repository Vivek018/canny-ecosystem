import {
  SUPABASE_BUCKET,
  SUPABASE_STORAGE,
} from "@canny_ecosystem/utils/constant";
import type { TypedSupabaseClient } from "../types";
import { updateUserById } from "../mutations";
import { getUserByEmail } from "../queries";

export async function uploadAvatar({
  supabase,
  avatar,
}: {
  supabase: TypedSupabaseClient;
  avatar: File;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: userData } = await getUserByEmail({
    supabase,
    email: user?.email ?? "",
  });

  if (avatar instanceof File) {
    const filePath = `${SUPABASE_STORAGE.AVATAR}/${userData?.id}`;
    const buffer = await avatar.arrayBuffer();
    const fileData = new Uint8Array(buffer);

    // Storing avatar in bucket
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
      .update(filePath, fileData, {
        contentType: avatar.type,
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("uploadAvatar Error", error);
      return { status: 500, error };
    }

    // Generating public URL for the uploaded logo
    const { data } = supabase.storage
      .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
      .getPublicUrl(filePath);

    // Setting avatar path in 'companies' table
    const { error: updateError, status } = await updateUserById({
      supabase,
      data: {
        id: userData?.id,
        avatar: data.publicUrl,
      },
    });

    if (updateError) {
      console.error("updateUserById Error", updateError);
      return { status, error: updateError };
    }

    return { status: 200, error: null };
  }

  return { status: 400, error: "File not uploaded by the user" };
}

export async function deleteAvatar({
  supabase,
}: { supabase: TypedSupabaseClient }) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: userData } = await getUserByEmail({
    supabase,
    email: user?.email ?? "",
  });
  const filePath = `${SUPABASE_STORAGE.AVATAR}/${userData?.id}`;
  const { error } = await supabase.storage
    .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
    .remove([filePath]);

  if (error) return { status: 500, error };
  return { status: 200, error };
}
