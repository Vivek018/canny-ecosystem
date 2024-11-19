import { HARD_QUERY_LIMIT } from "../constant";
import {
  FeedbackDatabaseRow,
  InferredType,
  TypedSupabaseClient,
  UserDatabaseRow,
} from "../types";

export type FeedbackDatabaseType = Pick<
  FeedbackDatabaseRow,
  | "id"
  | "subject"
  | "category"
  | "company_id"
  | "message"
  | "created_at"
  | "severity"
  | "updated_at"
> & {
  users: {
    id: UserDatabaseRow["id"];
    first_name: UserDatabaseRow["first_name"];
    last_name: UserDatabaseRow["last_name"];
    email: UserDatabaseRow["email"];
    avatar: UserDatabaseRow["avatar"];
  };
};

export async function getFeedbacksByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const columns = [
    "id",
    "subject",
    "category",
    "severity",
    "message",

    "company_id",
    "created_at",
  ] as const;

  const { data, error } = await supabase
    .from("feedback")
    .select(
      `${columns.join(",")}, users(id, first_name, last_name, email, avatar)`
    )
    .eq("company_id", companyId)
    .limit(HARD_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .returns<FeedbackDatabaseType[]>();

  if (error) {
    console.error(error);
  }

  return { data, error };
}
