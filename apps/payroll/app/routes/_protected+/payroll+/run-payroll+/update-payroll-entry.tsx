import type { ActionFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { safeRedirect } from "@/utils/server/http.server";
import { updateReimbursementsByEmployeeId } from "@canny_ecosystem/supabase/mutations";

export async function action({ request }: ActionFunctionArgs) {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();
    const site_id = formData.get("site_id");
    const employee_id = formData.get("employee_id") as string;
    const reimbursements = formData.get("reimbursements") as string;

    if (employee_id && reimbursements) {
        const data = {
            amount: Number.parseInt(reimbursements)
        }
        await updateReimbursementsByEmployeeId({ supabase, employee_id, data });
        return safeRedirect(`/payroll/run-payroll/site/${site_id}`, { status: 303 });
    }

    return null;
}