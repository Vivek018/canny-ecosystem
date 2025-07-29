import { convertToNull } from "@canny_ecosystem/utils";
import type {
  GratuityDatabaseInsert,
  GratuityDatabaseUpdate,
  TypedSupabaseClient,
} from "../types";

export const createGratuity = async ({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: GratuityDatabaseInsert;
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

  const { error, status } = await supabase.from("gratuity").insert(data);

  if (error) {
    console.error("createGratuity Error", error);
  }

  return {
    status,
    error,
  };
};

export const updateGratuity = async ({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: GratuityDatabaseUpdate;
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
    .from("gratuity")
    .update(updateData)
    .eq("id", data.id!);

  if (error) {
    console.error("updateGratuity Error", error);
  }

  return {
    status,
    error,
  };
};

export const deleteGratuity = async ({
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
    .from("gratuity")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteGratuity Error", error);
  }

  return {
    status,
    error,
  };
};
