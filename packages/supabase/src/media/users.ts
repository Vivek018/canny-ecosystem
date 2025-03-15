import {
  getFilePathFromUrl,
  SUPABASE_BUCKET,
  SUPABASE_STORAGE,
} from "@canny_ecosystem/utils/constant";
import type { TypedSupabaseClient } from "../types";
import { updateUserById } from "../mutations";
import { getUserByEmail } from "../queries";
import { isGoodStatus } from "@canny_ecosystem/utils";

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

  // delete old logo if exists
  const { status, error } = await deleteAvatar({ supabase });
  if (!isGoodStatus(status)) {
    console.error("deleteAvatar Error", error);
    return { status, error };
  }

  if (avatar instanceof File) {
    const filePath = `${SUPABASE_STORAGE.AVATAR}/${userData?.id}${avatar.name}`;
    const buffer = await avatar.arrayBuffer();
    const fileData = new Uint8Array(buffer);

    // Storing avatar in bucket
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
      .upload(filePath, fileData, {
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
  const filePath = getFilePathFromUrl(userData?.avatar ?? "");

  // deleting from bucket
  const { error } = await supabase.storage
    .from(SUPABASE_BUCKET.CANNY_ECOSYSTEM)
    .remove([filePath]);

  // setting avatar=NULL in user table
  const { error: updateError } = await updateUserById({
    supabase,
    data: {
      id: userData?.id,
      avatar: null,
    },
  });
  if (updateError) {
    console.error("updateUserById Error", updateError);
    return { status: 500, error: updateError };
  }

  if (error) return { status: 500, error };
  return { status: 200, error };
}
