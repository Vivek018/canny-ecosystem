import type {
  CompanyDatabaseInsert,
  LocationDatabaseInsert,
  LocationDatabaseUpdate,
  TypedSupabaseClient,
  UserDatabaseInsert,
} from "../types";

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

  const { error, status } = await supabase
    .from("company")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error(error);
  }

  return { status, error };
}

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
