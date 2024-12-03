import { isGoodStatus, z } from "@canny_ecosystem/utils";
import { parseWithZod } from "@conform-to/zod";
import { json } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { safeRedirect } from "@/utils/server/http.server";
import { getPaymentTemplateAssignmentIdBySiteId } from "@canny_ecosystem/supabase/queries";
import { updatePaymentTemplateAssignment } from "@canny_ecosystem/supabase/mutations";

const UpdateSiteLinkSchema = z.object({
    effective_from: z.string(),
    effective_to: z.string().optional(),
    template_id: z.string().uuid(),
});

export async function action({ request, params }: ActionFunctionArgs) {
    const { supabase } = getSupabaseWithHeaders({ request });
    const { projectId, siteId:site_id } = params;
    const formData = await request.formData();
    const submission = parseWithZod(formData, { schema: UpdateSiteLinkSchema });

    if (submission.status !== "success") {
        return json(
            { result: submission.reply() },
            { status: submission.status === "error" ? 400 : 200 },
        );
    }

    if(site_id){
        const { data } = await getPaymentTemplateAssignmentIdBySiteId({ supabase, site_id });
        if (data) {
            const templateAssignmentId = data.id;
            const { status, error } = await updatePaymentTemplateAssignment({
                supabase,
                data: {
                    ...submission.value,
                    assignment_type: "site",
                    site_id
                } as any,
                id: templateAssignmentId
            });
            if (isGoodStatus(status)) return safeRedirect(`/projects/${projectId}/sites`, { status: 303 });
    
            return json({ status, error });
        }
    }
    
    return null;
}