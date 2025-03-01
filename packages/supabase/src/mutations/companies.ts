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
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  companyData: CompanyDatabaseInsert;
  companyRegistrationDetails?: Omit<
    CompanyRegistrationDetailsInsert,
    "company_id"
  >;
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

  const { error, status, data } = await supabase
    .from("companies")
    .insert(companyData)
    .select("id")
    .single();

  if (error) {
    console.error("createCompany error:", error);
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
        data: { ...companyRegistrationDetails, company_id: data.id },
        bypassAuth,
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
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: CompanyDatabaseUpdate;
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
    .from("companies")
    .update(updateData)
    .eq("id", data.id!)
    .select()
    .single();

  if (error) {
    console.error("updateCompany error:", error);
  }

  return { status, error };
}

export async function deleteCompany({
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
    .from("companies")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteCompany error:", error);
  }

  return { status, error };
}

export async function createCompanyRegistrationDetails({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: CompanyRegistrationDetailsInsert;
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
    .from("company_registration_details")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("createCompanyRegistrationDetails error:", error);
  }

  return { status, error };
}

export async function updateOrCreateCompanyRegistrationDetails({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: CompanyRegistrationDetailsUpdate;
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

  if (!data.company_id) {
    return { status: 400, error: "Company ID is required" };
  }

  const { data: dataExist } = await getCompanyRegistrationDetailsByCompanyId({
    supabase,
    companyId: data?.company_id,
  });

  if (!dataExist) {
    return await createCompanyRegistrationDetails({
      supabase,
      data: { ...data, company_id: data?.company_id },
      bypassAuth,
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
    console.error("updateOrCreateCompanyRegistrationDetails Error", error);
  }

  return { status, error };
}

export async function createLocation({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: LocationDatabaseInsert;
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
    .from("company_locations")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("createLocation Error", error);
  }

  return { status, error };
}

export async function updateLocation({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: LocationDatabaseUpdate;
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
    console.error("updateLocation Error", error);
  }

  return { status, error };
}

export async function deleteLocation({
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
    .from("company_locations")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteLocation", error);
  }

  return { status, error };
}

export async function createRelationship({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: RelationshipDatabaseInsert;
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
    .from("company_relationships")
    .insert(data);

  if (error) {
    console.error("createRelationship Error", error);
  }

  return {
    status,
    error,
  };
}

export async function updateRelationship({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: RelationshipDatabaseUpdate;
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
    .from("company_relationships")
    .update(updateData)
    .eq("id", data.id!)
    .select()
    .single();

  if (error) {
    console.error("updateRelationship Error", error);
  }

  return { status, error };
}

export async function deleteRelationship({
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
    .from("company_relationships")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteRelationship Error", error);
  }

  return { status, error };
}