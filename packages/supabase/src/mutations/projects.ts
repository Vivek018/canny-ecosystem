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
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: ProjectDatabaseInsert;
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
    data: projectData,
  } = await supabase.from("projects").insert(data).select().single();

  if (error) {
    console.error("createProject Error:", error);
  }

  return { status, error, id: projectData?.id };
}

export async function updateProject({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: ProjectDatabaseUpdate;
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

  const updateData = convertToNull(data);

  const { error, status } = await supabase
    .from("projects")
    .update(updateData)
    .eq("id", data.id!)
    .select()
    .single();

  if (error) {
    console.error("updateProject Error:", error);
  }

  return { status, error };
}

export async function deleteProject({
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

  const { error, status } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    console.error("deleteProject Error:", error);
  }

  return { status, error };
}

// Project Sites
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
    data: projectSiteData,
  } = await supabase.from("project_sites").insert(data).select().single();

  if (projectSiteData?.id) {
    const { error: paySequenceError } = await supabase
      .from("site_pay_sequence")
      .insert({ site_id: projectSiteData.id })
      .single();

    if (paySequenceError) {
      console.error("createSite PaySequence Error:", paySequenceError);
    }
  }

  if (error) {
    console.error("createSite Error:", error);
  }

  return { data: projectSiteData, status, error };
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
    .from("project_sites")
    .update(data)
    .eq("id", data.id!)
    .select()
    .single();

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
    .from("project_sites")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteSite Error:", error);
  }

  return { status, error };
}

// Project Site Pay Sequence
export async function updateSitePaySequence({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: SitePaySequenceDatabaseUpdate;
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
    .from("site_pay_sequence")
    .update({ ...data, working_days: data.working_days?.sort() })
    .eq("id", data.id!)
    .select()
    .single();

  if (error) {
    console.error("updateSitePaySequence Error:", error);
  }

  return { status, error };
}