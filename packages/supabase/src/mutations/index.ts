import type {
  CompanyDatabaseInsert,
  CompanyDatabaseUpdate,
  LocationDatabaseInsert,
  LocationDatabaseUpdate,
  PaySequenceDatabaseUpdate,
  ProjectDatabaseInsert,
  ProjectDatabaseUpdate,
  TypedSupabaseClient,
  UserDatabaseInsert,
} from "../types";

// Users
export async function createUserOrUpdateLastCheckedIn({
  supabase,
}: { supabase: TypedSupabaseClient }) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return;
  }

  const { data: userData } = await supabase
    .from("user")
    .select("id")
    .eq("email", user.email)
    .single();

  if (userData) {
    return await updateUserLastCheckedIn({ supabase });
  }

  const { error, status } = await supabase.from("user").insert({
    first_name: user?.user_metadata.full_name.split(" ")[0],
    last_name: user?.user_metadata.full_name.split(" ")[1],
    email: user?.email,
    last_checked_in: new Date().toISOString(),
  });

  if (error) {
    console.error(error);
  }

  return { status };
}

export async function updateUserLastCheckedIn({
  supabase,
}: { supabase: TypedSupabaseClient }) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return;
  }

  const { error, status } = await supabase
    .from("user")
    .update({
      last_checked_in: new Date().toISOString(),
    })
    .eq("email", user.email);

  if (error) {
    console.error(error);
  }

  return { status };
}

export async function updateUser({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: UserDatabaseInsert;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return;
  }

  const { error, status } = await supabase
    .from("user")
    .update(data)
    .eq("email", user.email)
    .select()
    .single();

  if (error) {
    console.error(error);
  }

  return status;
}

// Companies
export async function createCompany({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: CompanyDatabaseInsert;
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
    data: companyData,
  } = await supabase.from("company").insert(data).select("id").single();

  if (error) {
    console.error(error);
  }

  return { status, error, id: companyData?.id };
}

export async function updateCompany({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: CompanyDatabaseUpdate;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { status: 400, error: "Unauthorized User" };
  }

  const { error, status } = await supabase
    .from("company")
    .update(data)
    .eq("id", data.id!)
    .select()
    .single();

  if (error) {
    console.error(error);
  }

  return { status, error };
}

export async function deleteCompany({
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
    .from("company")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
  }

  return { status, error };
}


// Projects
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

  const {
    error,
    status,
    data: projectData,
  } = await supabase.from("project").insert(data).select().single();

  if (projectData?.id) {
    const { error: paySequenceError } = await supabase
      .from("pay_sequence")
      .insert({ project_id: projectData.id })
      .single();

    if (paySequenceError) {
      console.error(paySequenceError);
    }
  }

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

  const { error, status } = await supabase
    .from("project")
    .update(data)
    .eq("id", data.id!)
    .select()
    .single();

  if (error) {
    console.error(error);
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
    .from("project")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
  }

  return { status, error };
}

// Pay Sequences
export async function updatePaySequence({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: PaySequenceDatabaseUpdate;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { status: 400, error: "Unauthorized User" };
  }

  const { error, status } = await supabase
    .from("pay_sequence")
    .update(data)
    .eq("id", data.id!)
    .select()
    .single();

  if (error) {
    console.error(error);
  }

  return { status, error };
}


// Locations
export async function createLocation({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: LocationDatabaseInsert;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { status: 400, error: "Unauthorized User" };
  }

  const { error, status } = await supabase
    .from("location")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error(error);
  }

  return { status, error };
}

export async function updateLocation({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: LocationDatabaseUpdate;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { status: 400, error: "Unauthorized User" };
  }

  const { error, status } = await supabase
    .from("location")
    .update(data)
    .eq("id", data.id!)
    .select()
    .single();

  if (error) {
    console.error(error);
  }

  return { status, error };
}

export async function deleteLocation({
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
    .from("location")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
  }

  return { status, error };
}
