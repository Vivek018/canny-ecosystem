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

  const query = supabase
    .from("holidays")
    .select(
      `
        ${columns.join(",")}
      `,
      { count: "exact" }
    )
    .eq("company_id", companyId);

  const { data, error } = await query;

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
