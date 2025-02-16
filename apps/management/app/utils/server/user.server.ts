import { getSessionUser } from "@canny_ecosystem/supabase/cached-queries";
import { getUserByEmail } from "@canny_ecosystem/supabase/queries";
import type {
  TypedSupabaseClient,
  UserDatabaseRow,
} from "@canny_ecosystem/supabase/types";
import { SECONDS_IN_A_MONTH } from "@canny_ecosystem/utils/constant";
import * as cookie from "cookie";

const cookieName = "user";

export type UserCookieType = Pick<
  UserDatabaseRow,
  "id" | "email" | "role" | "company_id"
>;

export async function getUserCookieOrFetchUser(
  request: Request,
  supabase: TypedSupabaseClient,
): Promise<{
  user: UserCookieType | null;
  setCookie: boolean;
}> {
  const cookieHeader = request.headers.get("Cookie");
  const parsed = cookieHeader ? cookie.parse(cookieHeader)[cookieName] : null;
  if (parsed?.length) {
    return { user: JSON.parse(parsed), setCookie: false };
  }

  const { user: sessionUser } = await getSessionUser({ request });

  let userData = null;
  if (sessionUser?.email) {
    const { data, error: userError } = await getUserByEmail({
      supabase,
      email: sessionUser.email,
    });
    if (userError) {
      throw userError;
    }

    userData = data;
  }
  if (userData) {
    return {
      user: {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        company_id: userData.company_id,
      },
      setCookie: true,
    };
  }
  return { user: null, setCookie: false };
}

export function setUserCookie(user: UserCookieType | null, deleteUser = false) {
  if (!user || deleteUser) {
    return cookie.serialize(cookieName, "", {
      path: "/",
      expires: new Date(0),
    });
  }
  return cookie.serialize(cookieName, JSON.stringify(user), {
    path: "/",
    maxAge: SECONDS_IN_A_MONTH,
  });
}
