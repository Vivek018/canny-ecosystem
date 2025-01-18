import type { ActionFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { safeRedirect } from "@/utils/server/http.server";
import { updatePayrollEntryByEmployeeIdAndPayrollIdAndPaymentTemplateComponentId } from "@canny_ecosystem/supabase/mutations";

export async function action({ request }: ActionFunctionArgs) {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();
    const siteId = formData.get("site_id");
    const employeeId = formData.get("employee_id") as string;
    const payrollId = formData.get("payrollId") as string;
    const templateComponents = JSON.parse(formData.get('templateComponents') as string);

    templateComponents.map(async (templateComponent: { name: string; paymentTemplateComponentId: string }) => {
        await updatePayrollEntryByEmployeeIdAndPayrollIdAndPaymentTemplateComponentId({
            supabase,
            data: { amount: Number(formData.get(templateComponent.paymentTemplateComponentId)) },
            employeeId,
            payrollId,
            paymentTemplateComponentId: templateComponent.paymentTemplateComponentId
        });
    });

    return safeRedirect(`/payroll/run-payroll/site/${siteId}`, { status: 303 });
}