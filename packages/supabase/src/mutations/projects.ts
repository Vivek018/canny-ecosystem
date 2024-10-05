import { convertToNull } from "@canny_ecosystem/utils";
import type {
  ProjectDatabaseInsert,
  ProjectDatabaseUpdate,
  SiteDatabaseInsert,
  SiteDatabaseUpdate,
  SitePaySequenceDatabaseUpdate,
  TypedSupabaseClient,
} from "../types";

export async function createProject({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: ProjectDatabaseInsert;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { status: 400, error: "Unauthorized User" };
  }

  const { error, status } = await supabase.from("projects").insert(data);

  if (error) {
    console.error(error);
  }

  return { status, error };
}

export async function updateProject({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: ProjectDatabaseUpdate;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { status: 400, error: "Unauthorized User" };
  }

  const updateData = convertToNull(data);

  const { error, status } = await supabase
    .from("projects")
    .update(updateData)
    .eq("id", data.id!)
    .select()
    .single();

  if (error) {
    console.error("error",error);
  }

  return { status, error };
}

export async function deleteProject({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { status: 400, error: "Unauthorized User" };
  }

  const { error, status } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
  }

  return { status, error };
}

// Project Sites
export async function createSite({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: SiteDatabaseInsert;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { status: 400, error: "Unauthorized User" };
  }

  const {
    error,
    status,
    data: projectSiteData,
  } = await supabase.from("project_sites").insert(data).select().single();

  if (projectSiteData?.id) {
    const { error: paySequenceError } = await supabase
      .from("site_pay_sequence")
      .insert({ site_id: projectSiteData.id })
      .single();

    if (paySequenceError) {
      console.error(paySequenceError);
    }
  }

  console.error(error);

  return { status, error };
}

export async function updateSite({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: SiteDatabaseUpdate;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { status: 400, error: "Unauthorized User" };
  }

  const { error, status } = await supabase
    .from("project_sites")
    .update(data)
    .eq("id", data.id!)
    .select()
    .single();

  if (error) {
    console.error(error);
  }

  return { status, error };
}

export async function deleteSite({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { status: 400, error: "Unauthorized User" };
  }

  const { error, status } = await supabase
    .from("project_sites")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
  }

  return { status, error };
}

// Project Site Pay Sequence
export async function updateSitePaySequence({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: SitePaySequenceDatabaseUpdate;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { status: 400, error: "Unauthorized User" };
  }

  const { error, status } = await supabase
    .from("site_pay_sequence")
    .update({ ...data, working_days: data.working_days?.sort() })
    .eq("id", data.id!)
    .select()
    .single();

  if (error) {
    console.error(error);
  }

  return { status, error };
}
