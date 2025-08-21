import { convertToNull } from "@canny_ecosystem/utils";
import type {
  TypedSupabaseClient,
  VehiclesDatabaseInsert,
  VehiclesDatabaseUpdate,
  VehiclesInsuranceDatabaseInsert,
  VehiclesInsuranceDatabaseUpdate,
  VehiclesLoanDetailsDatabaseInsert,
  VehiclesLoanDetailsDatabaseUpdate,
  VehiclesUsageDatabaseInsert,
  VehiclesUsageDatabaseUpdate,
} from "../types";

export async function createVehicles({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: VehiclesDatabaseInsert;
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
    .from("vehicles")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("createVehicles Error:", error);
  }

  return { status, error };
}

export async function updateVehicle({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: VehiclesDatabaseUpdate;
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
    .from("vehicles")
    .update(updateData)
    .eq("id", data.id!);
  if (error) {
    console.error("updateVehicle Error:", error);
  }

  return { status, error };
}

export async function deleteVehicle({
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
    .from("vehicles")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteVehicles Error:", error);
  }

  return { status, error };
}

export async function updateVehicleById({
  vehicleId,
  supabase,
  data,
}: {
  vehicleId: string;
  supabase: TypedSupabaseClient;
  data: VehiclesDatabaseUpdate;
}) {
  const { error, status } = await supabase
    .from("vehicles")
    .update(data)
    .eq("id", vehicleId ?? "")
    .single();

  if (error) {
    console.error("updateVehicleById Error:", error);
  }

  return { error, status };
}

export async function createVehicleInsurance({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: VehiclesInsuranceDatabaseInsert;
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
    .from("vehicle_insurance_details")
    .insert(data)
    .single();

  if (error) {
    console.error("createVehicleInsurance Error:", error);
  }

  return { error, status };
}

export async function deleteVehicleInsurance({
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
    .from("vehicle_insurance_details")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteVehicleInsurance Error:", error);
  }

  return { status, error };
}

export async function updateVehicleInsurance({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: VehiclesInsuranceDatabaseUpdate;
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
    .from("vehicle_insurance_details")
    .update(updateData)
    .eq("id", data.id!);
  if (error) {
    console.error("updateVehicleInsurance Error:", error);
  }

  return { status, error };
}

export async function updateVehicleInsuranceById({
  insuranceId,
  supabase,
  data,
}: {
  insuranceId: string;
  supabase: TypedSupabaseClient;
  data: VehiclesInsuranceDatabaseUpdate;
}) {
  const { error, status } = await supabase
    .from("vehicle_insurance_details")
    .update(data)
    .eq("id", insuranceId ?? "")
    .single();

  if (error) {
    console.error("updateVehicleInsuranceById Error:", error);
  }

  return { error, status };
}

export async function createVehicleUsageFromImportedData({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: VehiclesUsageDatabaseInsert[];
}) {
  const { error, status } = await supabase
    .from("vehicle_usage")
    .insert(data)
    .select();

  if (error) {
    console.error("createVehicleUsageFromImportedData Error:", error);
  }

  return { status, error };
}

export async function deleteVehicleUsageById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const { error, status } = await supabase
    .from("vehicle_usage")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteVehicleUsageById Error:", error);
    return { status, error };
  }

  if (status < 200 || status >= 300) {
    console.error("deleteVehicleUsageById Unexpected Supabase status:", status);
  }

  return { status, error: null };
}

export async function updateVehicleUsageById({
  usageId,
  supabase,
  data,
}: {
  usageId: string;
  supabase: TypedSupabaseClient;
  data: VehiclesUsageDatabaseUpdate;
}) {
  const { error, status } = await supabase
    .from("vehicle_usage")
    .update(data)
    .eq("id", usageId ?? "")
    .single();

  if (error) {
    console.error("updateVehicleUsageById Error:", error);
  }

  return { error, status };
}

export async function createVehicleUsageFromData({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: VehiclesUsageDatabaseInsert[];
}) {
  const { error, status } = await supabase.from("vehicle_usage").insert(data);
  if (error) {
    console.error("createVehicleUsageFromData Error:", error);
  }

  return { status, error };
}

export async function createVehicleLoan({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: VehiclesLoanDetailsDatabaseInsert;
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
    .from("loan_details")
    .insert(data)
    .single();

  if (error) {
    console.error("createVehicleLoan Error:", error);
  }

  return { error, status };
}

export async function deleteVehicleLoan({
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
    .from("loan_details")
    .delete()
    .eq("vehicle_id", id);

  if (error) {
    console.error("deleteVehicleLoan Error:", error);
  }

  return { status, error };
}

export async function updateVehicleLoan({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: VehiclesLoanDetailsDatabaseUpdate;
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
    .from("loan_details")
    .update(updateData)
    .eq("vehicle_id", data.vehicle_id!);
  if (error) {
    console.error("updateVehicleLoan Error:", error);
  }

  return { status, error };
}
