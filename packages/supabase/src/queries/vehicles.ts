import { HARD_QUERY_LIMIT } from "../constant";
import type {
  InferredType,
  TypedSupabaseClient,
  VehiclesDatabaseRow,
  VehiclesInsuranceDatabaseRow,
} from "../types";

export async function getVehiclesByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const columns = [
    "id",
    "company_id",
    "registration_number",
    "name",
    "ownership",
    "price",
    "monthly_rate",
    "is_active",
    "start_date",
    "end_date",
    "vehicle_type",
    "driver_id",
    "payee_id",
    "site_id",
    "photo",
  ] as const;

  const { data, error } = await supabase
    .from("vehicles")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .returns<Omit<VehiclesDatabaseRow, "created_at">[]>();

  if (error) {
    console.error("getVehiclesByCompanyId Error", error);
  }

  return { data, error };
}

export async function getVehicleById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "id",
    "company_id",
    "registration_number",
    "name",
    "ownership",
    "price",
    "monthly_rate",
    "is_active",
    "start_date",
    "end_date",
    "vehicle_type",
    "driver_id",
    "payee_id",
    "site_id",
    "photo",
  ] as const;

  const { data, error } = await supabase
    .from("vehicles")
    .select(columns.join(","))
    .eq("id", id)
    .single<Omit<VehiclesDatabaseRow, "created_at">>();

  if (error) {
    console.error("getVehicleById Error", error);
  }

  return { data, error };
}

export async function getVehiclePhotoUrlByRegistrationNumber({
  supabase,
  documentName,
}: {
  supabase: TypedSupabaseClient;
  documentName: string;
}) {
  const columns = ["photo"] as const;

  const { data, error } = await supabase
    .from("vehicles")
    .select(columns.join(","))
    .eq("registration_number", documentName)
    .maybeSingle<VehiclesDatabaseRow>();

  if (error)
    console.error("getVehiclePhotoUrlByRegistrationNumber Error", error);

  return { data, error };
}

export async function getVehicleInsuranceByVehicleId({
  supabase,
  vehicleId,
}: {
  supabase: TypedSupabaseClient;
  vehicleId: string;
}) {
  const columns = [
    "id",
    "vehicle_id",
    "insurance_number",
    "insurance_company",
    "insurance_yearly_amount",
    "start_date",
    "end_date",
    "document",
  ] as const;

  const { data, error } = await supabase
    .from("vehicle_insurance_details")
    .select(columns.join(","))
    .eq("vehicle_id", vehicleId)
    .limit(HARD_QUERY_LIMIT)
    .returns<
      | InferredType<VehiclesInsuranceDatabaseRow, (typeof columns)[number]>[]
      | null
    >();

  if (error) {
    console.error("getVehicleInsuranceByVehicleId Error", error);
  }

  return { data, error };
}

export async function getVehicleInsuranceById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "id",
    "vehicle_id",
    "insurance_number",
    "insurance_company",
    "insurance_yearly_amount",
    "start_date",
    "end_date",
    "document",
  ] as const;

  const { data, error } = await supabase
    .from("vehicle_insurance_details")
    .select(columns.join(","))
    .eq("id", id)
    .single<
      InferredType<VehiclesInsuranceDatabaseRow, (typeof columns)[number]>
    >();

  if (error) {
    console.error("getVehicleInsuranceById Error", error);
  }

  return { data, error };
}

export async function getVehicleInsuranceDocumentUrlByInsuranceNumber({
  supabase,
  documentName,
}: {
  supabase: TypedSupabaseClient;
  documentName: string;
}) {
  const columns = ["document"] as const;

  const { data, error } = await supabase
    .from("vehicle_insurance_details")
    .select(columns.join(","))
    .eq("insurance_number", documentName)
    .maybeSingle<VehiclesInsuranceDatabaseRow>();

  if (error)
    console.error(
      "getVehicleInsuranceDocumentUrlByInsuranceNumber Error",
      error
    );

  return { data, error };
}
