import { isGoodStatus } from "@canny_ecosystem/utils";
import { json } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { safeRedirect } from "@/utils/server/http.server";
import { deletePaymentTemplateAssignment } from "@canny_ecosystem/supabase/mutations";
import { getPaymentTemplateAssignmentIdBySiteId } from "@canny_ecosystem/supabase/queries";


export async function action({ request, params }: ActionFunctionArgs) {
    const { supabase } = getSupabaseWithHeaders({ request });
    const { projectId, siteId: site_id } = params;

    let templateAssignmentId = null;

    if (site_id) {
        const { data } = await getPaymentTemplateAssignmentIdBySiteId({ supabase, site_id });
        if (data) {
            templateAssignmentId = data?.id;
            const { status, error } = await deletePaymentTemplateAssignment({ supabase, id: templateAssignmentId });
            if (isGoodStatus(status)) return safeRedirect(`/projects/${projectId}/sites`, { status: 303 });

            return json({ status, error });
        }
    }

    return null;
}