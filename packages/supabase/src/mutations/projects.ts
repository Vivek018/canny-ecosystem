import { convertToNull } from "@canny_ecosystem/utils";
import type {
  DepartmentsDatabaseInsert,
  DepartmentsDatabaseUpdate,
  ProjectDatabaseInsert,
  ProjectDatabaseUpdate,
  SiteDatabaseInsert,
  SiteDatabaseUpdate,
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
    .eq("id", data.id!);
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

  const { error, status } = await supabase
    .from("projects")
    .delete()
    .eq("id", id);

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
    .from("project_sites")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteSite Error:", error);
  }

  return { status, error };
}

export async function createDepartment({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: DepartmentsDatabaseInsert;
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
    .from("departments")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("createDepartment Error:", error);
  }

  return { status, error };
}

export async function updateDepartmentById({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: DepartmentsDatabaseUpdate;
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
    .from("departments")
    .update(updateData)
    .eq("id", data.id!);
  if (error) {
    console.error("updateDepartment Error:", error);
  }

  return { status, error };
}

export async function deleteDepartment({
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

  const { error, status } = await supabase.from("departments").delete().eq("id", id);

  if (error) {
    console.error("deleteDepartment Error:", error);
  }

  return { status, error };
}
