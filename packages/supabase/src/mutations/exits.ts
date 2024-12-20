import { convertToNull } from "@canny_ecosystem/utils";
import type {
  ExitsInsert,
  ExitsUpdate,
  TypedSupabaseClient,
} from "../types";

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

  const {
    error,
    status,
    data: exitsData,
  } = await supabase
    .from("exits")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("error", error);
  }

  return {
    exitsData,
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

    if (!user?.email) {
      return { status: 400, error: "Unauthorized User" };
    }
  }

  const updateData = convertToNull(data);

  const { error, status } = await supabase
    .from("exits")
    .update(updateData)
    .eq("id", data.id!)
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

  const { error, status } = await supabase
    .from("exits")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
  }

  return {
    status,
    error,
  };
};
