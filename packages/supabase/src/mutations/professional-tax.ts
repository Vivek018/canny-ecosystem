import { convertToNull } from "@canny_ecosystem/utils";
import type {
  ProfessionalTaxDatabaseInsert,
  ProfessionalTaxDatabaseUpdate,
  TypedSupabaseClient,
} from "../types";

export async function createProfessionalTax({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: ProfessionalTaxDatabaseInsert;
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

  const newData = {
    ...data,
    gross_salary_range: JSON.parse(data.gross_salary_range as any),
  };

  const { error, status } = await supabase
    .from("professional_tax")
    .insert(newData);
  if (error) {
    console.error("createProfessionalTax Error:", error);
  }

  return { status, error };
}

export async function updateProfessionalTax({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: ProfessionalTaxDatabaseUpdate;
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

  const newData = {
    ...updateData,
    gross_salary_range: JSON.parse(updateData.gross_salary_range as any),
  };
  const { error, status } = await supabase
    .from("professional_tax")
    .update(newData)
    .eq("id", data.id!);
  if (error) {
    console.error("updateProfessionalTax Error:", error);
  }

  return { status, error };
}

export async function deleteProfessionalTax({
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
    .from("professional_tax")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteProfessionalTax Error:", error);
  }

  return { status, error };
}
