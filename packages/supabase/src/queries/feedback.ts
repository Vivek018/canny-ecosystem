import { LIST_LIMIT } from "../constant";
import type {
  FeedbackDatabaseRow,
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
  page = 1,
  limit = LIST_LIMIT,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
  page?: number;
  limit?: number;
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

  const start = (page - 1) * limit;
  const end = start + limit - 1;

  const { data, error, count } = await supabase
    .from("feedback")
    .select(
      `${columns.join(",")}, users(id, first_name, last_name, email, avatar)`,
      { count: "exact" },
    )
    .eq("company_id", companyId)
    .range(start, end)
    .order("created_at", { ascending: false })
    .returns<FeedbackDatabaseType[]>();

  if (error) {
    console.error(error);
  }

  return { data, error, totalCount: count ?? 0 };
}
