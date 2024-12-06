import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import CreateUser from "./create-user";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { json, useLoaderData } from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import { isGoodStatus, UserSchema } from "@canny_ecosystem/utils";
import { updateUserById } from "@canny_ecosystem/supabase/mutations";
import { getUserById } from "@canny_ecosystem/supabase/queries";

export const UPDATE_USER_TAG = "Update User";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = params.userId;
  const { supabase } = getSupabaseWithHeaders({ request });
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
}

export async function action({ request }: ActionFunctionArgs) {
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
}

export default function UpdateUser() {
  const { data } = useLoaderData<typeof loader>();

  return <CreateUser updateValues={data} />;
}
