import { DeleteEmployeeLinkSchema, isGoodStatus } from "@canny_ecosystem/utils";
import { parseWithZod } from "@conform-to/zod";
import { json } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { safeRedirect } from "@/utils/server/http.server";
import { deletePaymentTemplateAssignment } from "@canny_ecosystem/supabase/mutations";
import { getPaymentTemplateAssignmentIdByEmployeeId } from "@canny_ecosystem/supabase/queries";

export async function action({ request, params }: ActionFunctionArgs) {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();
    const { employeeId: employee_id } = params;

    const submission = parseWithZod(formData, { schema: DeleteEmployeeLinkSchema });

    if (submission.status !== "success") {
        return json(
            { result: submission.reply() },
            { status: submission.status === "error" ? 400 : 200 },
        );
    }

    let templateId = null;
    if(employee_id){
        const { data } = await getPaymentTemplateAssignmentIdByEmployeeId({ supabase, employee_id });
        templateId = data?.id;
    }

    if (templateId) {
        const { status, error } = await deletePaymentTemplateAssignment({ supabase, id: templateId });
        if (isGoodStatus(status)) return safeRedirect("/employees", { status: 303 });

        return json({ status, error });
    }

    return null;
}