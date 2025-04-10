import type { HolidaysDatabaseInsert, HolidaysDatabaseUpdate, TypedSupabaseClient } from "../types";

export async function addHolidaysFromData({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: HolidaysDatabaseInsert;
}) {
  const { error, status } = await supabase
    .from("holidays")
    .insert(data)
    ;

  if (error) {
    console.error("createHolidaysFromData Error:", error);
  }

  return { status, error };
}

export async function updateHolidaysById({
  holidaysId,
  supabase,
  data,
}: {
  holidaysId: string;
  supabase: TypedSupabaseClient;
  data: HolidaysDatabaseUpdate;
}) {
  const { error, status } = await supabase
    .from("holidays")
    .update(data)
    .eq("id", holidaysId ?? "")
    .single();

  if (error) {
    console.error("updateHolidaysById Error:", error);
  }

  return { error, status };
}

export async function deleteHolidaysById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const { error, status } = await supabase
    .from("holidays")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteHolidaysById Error:", error);
    return { status, error };
  }

  if (status < 200 || status >= 300) {
    console.error("deleteHolidaysById Unexpected Supabase status:", status);
  }

  return { status, error: null };
}