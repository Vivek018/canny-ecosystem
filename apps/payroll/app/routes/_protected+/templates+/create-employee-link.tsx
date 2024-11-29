import { isGoodStatus, paymentAssignmentTypesArray, z } from "@canny_ecosystem/utils";
import { parseWithZod } from "@conform-to/zod";
import { json } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { safeRedirect } from "@/utils/server/http.server";
import { createPaymentTemplateAssignment } from "@canny_ecosystem/supabase/mutations";

const CreateEmployeeLinkSchema = z.object({
    employee_id: z.string(),
    is_active: z.enum(["true", "false"]).transform((val) => val === "true"),
    template_id: z.string().uuid(),
    assignment_type: z.enum(paymentAssignmentTypesArray).default("employee"),
    effective_from: z.string(),
    effective_to: z.string().optional(),
    position: z.string().optional(),
    skill_level: z.string().optional(),
    eligibility_option: z.string().optional()
});

export async function action({ request }: ActionFunctionArgs) {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();
    const submission = parseWithZod(formData, { schema: CreateEmployeeLinkSchema });

    if (submission.status !== "success") {
        return json(
            { result: submission.reply() },
            { status: submission.status === "error" ? 400 : 200 },
        );
    }

    const { status, error } = await createPaymentTemplateAssignment({ supabase, data: submission.value as any });

    if (isGoodStatus(status)) return safeRedirect("/employees", { status: 303 });

    return json({ status, error });
}