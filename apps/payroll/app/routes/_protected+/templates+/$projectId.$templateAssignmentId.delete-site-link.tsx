import { isGoodStatus } from "@canny_ecosystem/utils";
import { json } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { safeRedirect } from "@/utils/server/http.server";
import { deletePaymentTemplateAssignment } from "@canny_ecosystem/supabase/mutations";

export async function action({ request, params }: ActionFunctionArgs) {
    const { supabase } = getSupabaseWithHeaders({ request });
    const { projectId, templateAssignmentId } = params;

    const { status, error } = await deletePaymentTemplateAssignment({
        supabase,
        id: templateAssignmentId as string
    });
    if (isGoodStatus(status)) return safeRedirect(`/projects/${projectId}/sites`, { status: 303 });

    return json({ status, error });
}