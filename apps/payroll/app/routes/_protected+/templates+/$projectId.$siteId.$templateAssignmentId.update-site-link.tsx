import { isGoodStatus, UpdateSiteLinkSchema } from "@canny_ecosystem/utils";
import { parseWithZod } from "@conform-to/zod";
import { json } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { safeRedirect } from "@/utils/server/http.server";
import { updatePaymentTemplateAssignment } from "@canny_ecosystem/supabase/mutations";

export async function action({ request, params }: ActionFunctionArgs) {
    const { supabase } = getSupabaseWithHeaders({ request });
    const { templateAssignmentId, siteId: site_id, projectId } = params;
    const formData = await request.formData();

    const submission = parseWithZod(formData, { schema: UpdateSiteLinkSchema });

    if (submission.status !== "success") {
        return json(
            { result: submission.reply() },
            { status: submission.status === "error" ? 400 : 200 },
        );
    }

    const { status, error } = await updatePaymentTemplateAssignment(
        {
            supabase,
            data: {
                ...submission.value,
                assignment_type: "site",
                site_id
            } as any,
            id: templateAssignmentId as string
        });
    if (isGoodStatus(status)) return safeRedirect(`/projects/${projectId}/sites`, { status: 303 });

    return json({ status, error });
}