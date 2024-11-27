import { safeRedirect } from "@/utils/server/http.server";
import { updateUser } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { UpdateUserContactSchema } from "@canny_ecosystem/utils";
import { parseWithZod } from "@conform-to/zod";
import { type ActionFunctionArgs, json } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: UpdateUserContactSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }

  const status = await updateUser({
    supabase,
    data: submission.value,
  });

  if (typeof status === "number") {
    if (status !== 200) {
      console.log(status);
    }
  }

  return safeRedirect("/account");
}
