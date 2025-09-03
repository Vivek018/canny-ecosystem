import { months } from "@canny_ecosystem/utils/constant";
import { filterComparison, HARD_QUERY_LIMIT } from "../constant";
import type {
  InferredType,
  SiteDatabaseRow,
  TypedSupabaseClient,
  VehiclesDatabaseRow,
  VehiclesInsuranceDatabaseRow,
  VehiclesLoanDetailsDatabaseRow,
  VehiclesUsageDatabaseRow,
} from "../types";

export type ImportVehicleUsageDataType = Pick<
  VehiclesUsageDatabaseRow,
  | "month"
  | "year"
  | "kilometers"
  | "fuel_in_liters"
  | "fuel_amount"
  | "toll_amount"
  | "maintainance_amount"
> & {
  registration_number: VehiclesDatabaseRow["registration_number"];
};

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
    .select(
      `
      ${columns.join(",")},
      payee:payee_id ( name ),
      driver:driver_id ( first_name, last_name ),
      site:site_id ( name )
    `,
    )
    .eq("id", id)
    .single<
      Omit<VehiclesDatabaseRow, "created_at"> & {
        payee: { name: string } | null;
        driver: { first_name: string; last_name: string } | null;
        site: { name: string } | null;
      }
    >();

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
      error,
    );

  return { data, error };
}

export type VehicleUsageFilters = {
  name?: string | undefined | null;
  site?: string | undefined | null;
  month?: string | undefined | null;
  year?: string | undefined | null;
  recently_added?: string | undefined | null;
  vehicle_no?: string | undefined | null; /////
};

export type VehicleUsageDataType = Pick<
  VehiclesUsageDatabaseRow,
  | "id"
  | "vehicle_id"
  | "month"
  | "year"
  | "kilometers"
  | "fuel_in_liters"
  | "fuel_amount"
  | "toll_amount"
  | "maintainance_amount"
> & {
  vehicles: Pick<
    VehiclesDatabaseRow,
    "registration_number" | "id" | "company_id"
  > & {
    sites: Pick<SiteDatabaseRow, "id" | "name">;
  };
};

export async function getVehicleUsageByCompanyId({
  supabase,
  companyId,
  params,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
  params: {
    from: number;
    to: number;
    sort?: [string, "asc" | "desc"];
    searchQuery?: string;
    filters?: VehicleUsageFilters | null;
  };
}) {
  const { from, to, sort, searchQuery, filters } = params;

  const { site, month, year, vehicle_no, recently_added } = filters ?? {};

  const columns = [
    "id",
    "vehicle_id",
    "month",
    "year",
    "kilometers",
    "fuel_in_liters",
    "fuel_amount",
    "toll_amount",
    "maintainance_amount",
  ] as const;

  const query = supabase
    .from("vehicle_usage")
    .select(
      `${columns.join(",")},
          vehicles!inner(id, registration_number,sites!inner(id,name))`,
      { count: "exact" },
    )
    .eq("vehicles.company_id", companyId);

  if (sort) {
    const [column, direction] = sort;
    const usageCols = [
      "kilometers",
      "fuel_in_liters",
      "fuel_amount",
      "toll_amount",
      "maintainance_amount",
    ];

    if (usageCols.includes(column)) {
      query.order(column, { ascending: direction === "asc" });
    } else {
      query.order("created_at", { ascending: false });
    }
  } else {
    query.order("created_at", { ascending: false });
  }

  if (searchQuery) {
    query.or(`registration_number.ilike.*${searchQuery}*`, {
      referencedTable: "vehicles",
    });
  }

  if (recently_added) {
    const now = new Date();
    const diff =
      filterComparison[recently_added as keyof typeof filterComparison];
    if (diff) {
      const startTime = new Date(now.getTime() - diff).toISOString();
      query.gte("created_at", startTime);
    }
  }
  if (vehicle_no) query.eq("vehicles.registration_number", vehicle_no);
  if (site) query.eq("vehicles.sites.name", site);
  if (month) query.eq("month", Number(months[month]));
  if (year) query.eq("year", Number(year));

  const { data, count, error } = await query.range(from, to);
  if (error) {
    console.error("getVehicleUsageByCompanyId Error", error);
  }

  return { data, meta: { count }, error };
}

export async function getVehicleIdsByRegistrationNumber({
  supabase,
  numbers,
}: {
  supabase: TypedSupabaseClient;
  numbers: string[];
}) {
  const columns = ["registration_number", "id"] as const;

  const { data, error } = await supabase
    .from("vehicles")
    .select(columns.join(","))
    .in("registration_number", numbers)
    .returns<InferredType<VehiclesDatabaseRow, (typeof columns)[number]>[]>();

  if (error) {
    console.error("getVehicleIdsByRegistrationNumber Error", error);
    return { data: [], missing: [], error };
  }

  return { data, error };
}

export async function getVehicleUsageById({
  supabase,
  usageId,
}: {
  supabase: TypedSupabaseClient;
  usageId: string;
}) {
  const columns = [
    "id",
    "vehicle_id",
    "month",
    "year",
    "kilometers",
    "fuel_in_liters",
    "fuel_amount",
    "toll_amount",
    "maintainance_amount",
  ] as const;

  const { data, error } = await supabase
    .from("vehicle_usage")
    .select(
      `
      ${columns.join(",")},
      vehicle:vehicle_id ( payee_id )
    `,
    )
    .eq("id", usageId)
    .single<
      InferredType<VehiclesUsageDatabaseRow, (typeof columns)[number]> & {
        vehicle: { payee_id: string } | null;
      }
    >();

  if (error) {
    console.error("getVehicleUsageById Error", error);
  }

  return { data, error };
}

export async function getVehicleLoanDetailsByVehicleId({
  supabase,
  vehicleId,
}: {
  supabase: TypedSupabaseClient;
  vehicleId: string;
}) {
  const columns = [
    "vehicle_id",
    "bank_name",
    "start_date",
    "end_date",
    "period",
    "monthly_emi",
    "document",
    "amount",
    "interest",
  ] as const;

  const { data, error } = await supabase
    .from("loan_details")
    .select(columns.join(","))
    .eq("vehicle_id", vehicleId)
    .maybeSingle<
      InferredType<VehiclesLoanDetailsDatabaseRow, (typeof columns)[number]>
    >();
  if (error) {
    console.error("getVehicleLoanDetailsByVehicleId Error", error);
  }

  return { data, error };
}

export async function getVehicleLoanDocumentUrlByVehicleId({
  supabase,
  vehicleId,
}: {
  supabase: TypedSupabaseClient;
  vehicleId: string;
}) {
  const columns = ["document"] as const;

  const { data, error } = await supabase
    .from("loan_details")
    .select(columns.join(","))
    .eq("vehicle_id", vehicleId)
    .maybeSingle<VehiclesLoanDetailsDatabaseRow>();

  if (error) console.error("getVehicleLoanDocumentUrlByVehicleId Error", error);

  return { data, error };
}

////////////////////////////////////////////////////////////

export async function getVehiclesBySiteIds({
  supabase,
  siteId,
}: {
  supabase: TypedSupabaseClient;
  siteId: string[];
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
    .in("site_id", siteId)
    .order("created_at", { ascending: false })
    .returns<Omit<VehiclesDatabaseRow, "created_at">[]>();

  if (error) {
    console.error("getVehiclesBysiteId Error", error);
  }

  return { data, error };
}

export async function getVehicleUsageBySiteIds({
  supabase,
  siteIds,
  params,
}: {
  supabase: TypedSupabaseClient;
  siteIds: string[];
  params: {
    from: number;
    to: number;
    sort?: [string, "asc" | "desc"];
    searchQuery?: string;
    filters?: VehicleUsageFilters | null;
  };
}) {
  const { from, to, sort, searchQuery, filters } = params;

  const { site, month, year, vehicle_no } = filters ?? {};

  const columns = [
    "id",
    "vehicle_id",
    "month",
    "year",
    "kilometers",
    "fuel_in_liters",
    "fuel_amount",
    "toll_amount",
    "maintainance_amount",
  ] as const;

  const query = supabase
    .from("vehicle_usage")
    .select(
      `${columns.join(",")},
          vehicles!inner(id, registration_number,sites!inner(id,name))`,
      { count: "exact" },
    )
    .in("vehicles.site_id", siteIds);

  if (sort) {
    const [column, direction] = sort;
    const usageCols = [
      "kilometers",
      "fuel_in_liters",
      "fuel_amount",
      "toll_amount",
      "maintainance_amount",
    ];

    if (usageCols.includes(column)) {
      query.order(column, { ascending: direction === "asc" });
    } else {
      query.order("created_at", { ascending: false });
    }
  } else {
    query.order("created_at", { ascending: false });
  }

  if (searchQuery) {
    query.or(`registration_number.ilike.*${searchQuery}*`, {
      referencedTable: "vehicles",
    });
  }

  if (vehicle_no) query.eq("vehicles.registration_number", vehicle_no);
  if (site) query.eq("vehicles.sites.name", site);
  if (month) query.eq("month", Number(months[month]));
  if (year) query.eq("year", Number(year));

  const { data, count, error } = await query.range(from, to);
  if (error) {
    console.error("getVehicleUsageBySiteIds Error", error);
  }

  return { data, meta: { count }, error };
}
