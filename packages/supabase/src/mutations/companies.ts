import type {
  CompanyDatabaseInsert,
  CompanyDatabaseUpdate,
  CompanyRegistrationDetailsInsert,
  CompanyRegistrationDetailsUpdate,
  TypedSupabaseClient,
} from "../types";

export async function createCompany({
  supabase,
  companyData,
  companyRegistrationDetails,
}: {
  supabase: TypedSupabaseClient;
  companyData: CompanyDatabaseInsert;
  companyRegistrationDetails: Omit<
    CompanyRegistrationDetailsInsert,
    "company_id"
  >;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { status: 400, error: "Unauthorized User" };
  }

  const { error, status, data } = await supabase
    .from("companies")
    .insert(companyData)
    .select("id")
    .single();

  if (error) {
    console.error(error);
  }

  if (data?.id) {
    const { error: registrationDetailsError } = await supabase
      .from("company_registration_details")
      .insert({
        company_id: data.id,
        ...companyRegistrationDetails,
      });

    if (registrationDetailsError) {
      console.error(registrationDetailsError);
    }
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
    .from("companies")
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
    .from("companies")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
  }

  return { status, error };
}

// Company Registration Details
export async function updateCompanyRegistrationDetails({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: CompanyRegistrationDetailsUpdate;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { status: 400, error: "Unauthorized User" };
  }

  const { error, status } = await supabase
    .from("company_registration_details")
    .update(data)
    .eq("company_id", data.company_id!)
    .select()
    .single();

  if (error) {
    console.error(error);
  }

  return { status, error };
}
