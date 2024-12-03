import { isGoodStatus, z } from "@canny_ecosystem/utils";
import { parseWithZod } from "@conform-to/zod";
import { json } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { safeRedirect } from "@/utils/server/http.server";
import { createPaymentTemplateAssignment } from "@canny_ecosystem/supabase/mutations";

const CreateSiteLinkSchema = z.object({
    effective_from: z.string(),
    effective_to: z.string().optional(),
    template_id: z.string().uuid(),
});

export async function action({ request, params }: ActionFunctionArgs) {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();
    const { projectId, siteId } = params;

    const submission = parseWithZod(formData, { schema: CreateSiteLinkSchema });

    if (submission.status !== "success") {
        return json(
            { result: submission.reply() },
            { status: submission.status === "error" ? 400 : 200 },
        );
    }

    const { status, error } = await createPaymentTemplateAssignment({
        supabase,
        data: {
            ...submission.value,
            assignment_type: "site",
            site_id: siteId
        } as any
    });

    if (isGoodStatus(status)) return safeRedirect(`/projects/${projectId}/sites`, { status: 303 });

    return json({ status, error });
}