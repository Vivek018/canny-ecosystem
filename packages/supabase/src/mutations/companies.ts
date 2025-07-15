import { convertToNull } from "@canny_ecosystem/utils";
import type {
  CompanyDatabaseInsert,
  CompanyDatabaseUpdate,
  LocationDatabaseInsert,
  LocationDatabaseUpdate,
  RelationshipDatabaseInsert,
  RelationshipDatabaseUpdate,
  TypedSupabaseClient,
} from "../types";

export async function createCompany({
  supabase,
  companyData,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  companyData: CompanyDatabaseInsert;
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
    .insert(companyData)
    .select("id")
    .single();

  if (error) {
    console.error("createCompany error:", error);
    return {
      status,
      error,
    };
  }

  return {
    status,
    error: null,
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
    .eq("id", data.id!);

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
    .insert(data);

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
    .eq("id", data.id!);

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
    .eq("id", data.id!);
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

// Company Documents
export async function addCompanyDocument({
  supabase,
  companyId,
  documentName,
  url,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
  documentName: string;
  url: string;
}) {
  const dataToBeInserted = convertToNull({
    company_id: companyId,
    name: documentName,
    url,
  });
  const { status, error } = await supabase
    .from("company_documents")
    .insert(dataToBeInserted);

  return { status, error };
}

export async function deleteCompanyDocumentByCompanyId({
  supabase,
  companyId,
  documentName,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
  documentName: string;
}) {
  const { error, status } = await supabase
    .from("company_documents")
    .delete()
    .eq("company_id", companyId)
    .eq("name", documentName);

  return { status, error };
}
