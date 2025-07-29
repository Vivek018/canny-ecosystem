import { convertToNull } from "@canny_ecosystem/utils";
import type {
  LeaveEncashmentDatabaseInsert,
  LeaveEncashmentDatabaseUpdate,
  TypedSupabaseClient,
} from "../types";

export const createLeaveEncashment = async ({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: LeaveEncashmentDatabaseInsert;
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
    .from("leave_encashment")
    .insert(data);

  if (error) {
    console.error("createLeaveEncashment Error", error);
  }

  return {
    status,
    error,
  };
};

export const updateLeaveEncashment = async ({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: LeaveEncashmentDatabaseUpdate;
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
    .from("leave_encashment")
    .update(updateData)
    .eq("id", data.id!);

  if (error) {
    console.error("updateLeaveEncashment Error", error);
  }

  return {
    status,
    error,
  };
};

export const deleteLeaveEncashment = async ({
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
    .from("leave_encashment")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteLeaveEncashment Error", error);
  }

  return {
    status,
    error,
  };
};
