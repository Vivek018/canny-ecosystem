import type { SiteDatabaseInsert, SiteDatabaseUpdate, TypedSupabaseClient } from "../types";

export async function createSite({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: SiteDatabaseInsert;
  bypassAuth?: boolean;
}) {
  if (!bypassAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return { status: 400, error: "Unauthorized User" };
    }
  }

  const {
    error,
    status,
    data: siteData,
  } = await supabase.from("sites").insert(data).select().single();

  if (error) {
    console.error("createSite Error:", error);
  }

  return { data: siteData, status, error };
}

export async function updateSite({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: SiteDatabaseUpdate;
  bypassAuth?: boolean;
}) {
  if (!bypassAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return { status: 400, error: "Unauthorized User" };
    }
  }

  const { error, status } = await supabase
    .from("sites").update(data)
    .eq("id", data.id!);
  if (error) {
    console.error("updateSite Error:", error);
  }

  return { status, error };
}

export async function deleteSite({
  supabase,
  id,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  id: string;
  bypassAuth?: boolean;
}) {
  if (!bypassAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return { status: 400, error: "Unauthorized User" };
    }
  }

  const { error, status } = await supabase
    .from("sites").delete()
    .eq("id", id);

  if (error) {
    console.error("deleteSite Error:", error);
  }

  return { status, error };
}