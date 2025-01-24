import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import CreateUser from "./create-user";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { json, useLoaderData } from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import {
  hasPermission,
  isGoodStatus,
  updateRole,
  UserSchema,
} from "@canny_ecosystem/utils";
import { updateUserById } from "@canny_ecosystem/supabase/mutations";
import { getUserById } from "@canny_ecosystem/supabase/queries";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";

export const UPDATE_USER_TAG = "Update User";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = params.userId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.settingUsers}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  try {
    let userData = null;

    if (userId) {
      const { data, error } = await getUserById({
        supabase,
        id: userId,
      });

      if (error) {
        throw error;
      }

      userData = data;
    }

    return json({ data: userData });
  } catch (error) {
    return json({
      error,
      data: null,
    });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();
    const submission = parseWithZod(formData, { schema: UserSchema });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }

    const { status, error } = await updateUserById({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status))
      return safeRedirect("/settings/users", { status: 303 });

    return json({ status, error });
  } catch (error) {
    return json({
      error,
      status: null,
    });
  }
}

export default function UpdateUser() {
  const { data } = useLoaderData<typeof loader>();

  return <CreateUser updateValues={data} />;
}
