import { HARD_QUERY_LIMIT } from "../constant";
import type {
  HolidaysDatabaseRow,
  InferredType,
  TypedSupabaseClient,
} from "../types";

export type HolidaysDataType = Pick<
  HolidaysDatabaseRow,
  "id" | "company_id" | "name" | "is_mandatory" | "start_date" | "no_of_days"
>;

export async function getHolidaysByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const columns = [
    "id",
    "company_id",
    "name",
    "is_mandatory",
    "start_date",
    "no_of_days",
  ] as const;

  const { data, error } = await supabase
    .from("holidays")
    .select(`${columns.join(",")}`)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(HARD_QUERY_LIMIT)
    .returns<InferredType<HolidaysDatabaseRow, (typeof columns)[number]>[]>();

  if (error) {
    console.error("getHolidaysByEmployeeId Error", error);
  }

  return { data, error };
}

export async function getHolidaysById({
  supabase,
  holidayId,
}: {
  supabase: TypedSupabaseClient;
  holidayId: string;
}) {
  const columns = [
    "id",
    "company_id",
    "name",
    "is_mandatory",
    "start_date",
    "no_of_days",
  ] as const;

  const { data, error } = await supabase
    .from("holidays")
    .select(columns.join(","))
    .eq("id", holidayId)
    .single<InferredType<HolidaysDatabaseRow, (typeof columns)[number]>>();

  if (error) {
    console.error("getHolidaysById Error", error);
  }

  return { data, error };
}
