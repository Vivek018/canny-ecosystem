import { getCompanyRegistrationDetailsByCompanyIdQuery } from "../queries";
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
    console.error("company ", error);
    return {
      status,
      companyError: error,
      registrationDetailsError: null,
      id: null,
    };
  }

  if (data?.id) {
    const { error: registrationDetailsError, status } =
      await createCompanyRegistrationDetails({
        supabase,
        data: { company_id: data.id, ...companyRegistrationDetails },
      });

    if (registrationDetailsError) {
      console.error("registrationDetails ", registrationDetailsError);
      return {
        status,
        companyError: null,
        registrationDetailsError,
        id: data?.id,
      };
    }
  }

  return {
    status,
    companyError: null,
    registrationDetailsError: null,
    id: data?.id,
  };
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
export async function createCompanyRegistrationDetails({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: CompanyRegistrationDetailsInsert;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { status: 400, error: "Unauthorized User" };
  }

  const { error, status } = await supabase
    .from("company_registration_details")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error(error);
  }

  return { status, error };
}

export async function updateOrCreateCompanyRegistrationDetails({
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

  if (!data.company_id) {
    return { status: 400, error: "Company ID is required" };
  }

  const { data: dataExist } =
    await getCompanyRegistrationDetailsByCompanyIdQuery({
      supabase,
      companyId: data.company_id,
    });

  if (!dataExist) {
    return await createCompanyRegistrationDetails({
      supabase,
      data: data as any,
    });
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
