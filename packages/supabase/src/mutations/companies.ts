import { convertToNull } from "@canny_ecosystem/utils";
import { getCompanyRegistrationDetailsByCompanyId } from "../queries";
import type {
  CompanyDatabaseInsert,
  CompanyDatabaseUpdate,
  CompanyRegistrationDetailsInsert,
  CompanyRegistrationDetailsUpdate,
  LocationDatabaseInsert,
  LocationDatabaseUpdate,
  RelationshipDatabaseInsert,
  RelationshipDatabaseUpdate,
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
    const { error: registrationDetailsError } =
      await createCompanyRegistrationDetails({
        supabase,
        data: { company_id: data.id, ...companyRegistrationDetails },
      });

    return {
      status,
      companyError: null,
      registrationDetailsError,
      id: data?.id,
    };
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

  const updateData = convertToNull(data);

  const { error, status } = await supabase
    .from("companies")
    .update(updateData)
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

  const { data: dataExist } = await getCompanyRegistrationDetailsByCompanyId({
    supabase,
    companyId: data.company_id,
  });

  if (!dataExist) {
    return await createCompanyRegistrationDetails({
      supabase,
      data: data as any,
    });
  }

  const updateData = convertToNull(data);

  const { error, status } = await supabase
    .from("company_registration_details")
    .update(updateData)
    .eq("company_id", data.company_id!)
    .select()
    .single();

  if (error) {
    console.error(error);
  }

  return { status, error };
}

// Company Locations
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
    .from("company_locations")
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

  if (!data.company_id) {
    return { status: 400, error: "Company ID is required" };
  }

  const updateData = convertToNull(data);

  const { error, status } = await supabase
    .from("company_locations")
    .update(updateData)
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
    .from("company_locations")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
  }

  return { status, error };
}

// Company Relationships
export async function createRelationship({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: RelationshipDatabaseInsert;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { status: 400, error: "Unauthorized User" };
  }

  const { error, status } = await supabase
    .from("company_relationships")
    .insert(data);

  if (error) {
    console.error(error);
  }

  return {
    status,
    error,
  };
}

export async function updateRelationship({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: RelationshipDatabaseUpdate;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { status: 400, error: "Unauthorized User" };
  }

  const updateData = convertToNull(data);

  const { error, status } = await supabase
    .from("company_relationships")
    .update(updateData)
    .eq("id", data.id!)
    .select()
    .single();

  if (error) {
    console.error(error);
  }

  return { status, error };
}

export async function deleteRelationship({
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
    .from("company_relationships")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
  }

  return { status, error };
}
