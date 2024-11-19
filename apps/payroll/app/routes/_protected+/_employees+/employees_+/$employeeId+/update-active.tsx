import { safeRedirect } from "@/utils/server/http.server";
import { updateEmployee } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { isGoodStatus, z } from "@canny_ecosystem/utils";
import { parseWithZod } from "@conform-to/zod";
import { json, type ActionFunctionArgs } from "@remix-run/node";

const UpdateActiveSchema = z.object({
  id: z.string(),
  is_active: z.enum(["true", "false"]).transform((val) => val === "true"),
});

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: UpdateActiveSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { status, error } = await updateEmployee({
    supabase,
    data: submission.value,
  });

  const returnTo = formData.get("returnTo");
  if (isGoodStatus(status)) {
    return safeRedirect(returnTo ?? "/employees", { status: 303 });
  }
  return json({ status, error });
}
