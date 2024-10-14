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

export const getSessionUser = async ({ request }: { request: Request }) => {
  // const { session } = await getSupabaseWithSessionAndHeaders({
  //   request,
  // });

  // const user = session?.user;

  // return { session, user };
  return { user: { name: "Condra", email: "dvzcvdsv@gmail.com" } };
};
