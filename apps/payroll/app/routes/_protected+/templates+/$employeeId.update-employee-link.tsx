import { isGoodStatus, UpdateEmployeeLinkSchema } from "@canny_ecosystem/utils";
import { parseWithZod } from "@conform-to/zod";
import { json } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { safeRedirect } from "@/utils/server/http.server";
import { updatePaymentTemplateAssignment } from "@canny_ecosystem/supabase/mutations";
import { getPaymentTemplateAssignmentIdByEmployeeId } from "@canny_ecosystem/supabase/queries";



export async function action({ request, params }: ActionFunctionArgs) {
    const { supabase } = getSupabaseWithHeaders({ request });
    const { employeeId: employee_id } = params;
    const formData = await request.formData();

    const submission = parseWithZod(formData, { schema: UpdateEmployeeLinkSchema });

    if (submission.status !== "success") {
        return json(
            { result: submission.reply() },
            { status: submission.status === "error" ? 400 : 200 },
        );
    }

    if (employee_id) {
        const { data } = await getPaymentTemplateAssignmentIdByEmployeeId({ supabase, employee_id });
        if (data) {
            const templateAssignmentId = data.id;
            const { status, error } = await updatePaymentTemplateAssignment({
                supabase,
                data: {
                    ...submission.value,
                    employee_id,
                    assignment_type: "employee"
                } as any,
                id: templateAssignmentId
            });
            if (isGoodStatus(status)) return safeRedirect("/employees", { status: 303 });

            return json({ status, error });
        }
    }

    return null;
}