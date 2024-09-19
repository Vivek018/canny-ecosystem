import { getSupabaseWithSessionAndHeaders } from "../clients/server";

export const getAuthUser = async ({ request }: { request: Request }) => {
  const { session, supabase } = await getSupabaseWithSessionAndHeaders({
    request,
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { session, user };
};
