import { safeRedirect } from "@/utils/server/http.server";
import { updateProject } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { isGoodStatus, z } from "@canny_ecosystem/utils";
import { parseWithZod } from "@conform-to/zod";
import { json, type ActionFunctionArgs } from "@remix-run/node";

const UpdateCompletedSchema = z.object({
  id: z.string(),
  actual_end_date: z.any(),
  status: z.enum(["completed", "active"]),
});

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: UpdateCompletedSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { status, error } = await updateProject({
    supabase,
    data: submission.value,
  });

  const returnTo = formData.get("returnTo");
  if (isGoodStatus(status)) {
    return safeRedirect(returnTo ?? "/projects", { status: 303 });
  }
  return json({ status, error });
}
