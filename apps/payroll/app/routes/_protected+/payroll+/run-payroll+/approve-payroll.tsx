import type { ActionFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { safeRedirect } from "@/utils/server/http.server";
import { createPayroll } from "@canny_ecosystem/supabase/mutations";
import type { PayrollDatabaseInsert } from "@canny_ecosystem/supabase/types";
import type { PayrollEmployeeData } from "@canny_ecosystem/utils";

export async function action({ request }: ActionFunctionArgs) {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();
    const stringData = formData.get('data') as string;
    const parsedData = JSON.parse(stringData);

    const data: Omit<PayrollDatabaseInsert, | "created_at" | "updated_at"> = {
        site_id: parsedData[0].site_id,
        status: "approved",
        run_date: new Date().toISOString().split('T')[0],
        total_net_amount: parsedData.reduce((sum: number, employee: PayrollEmployeeData) => sum + employee.net_pay, 0),
        total_employees: parsedData.length,
        commission: 0
    }

    data.commission = 0.03 * (data.total_net_amount ?? 0);
    await createPayroll({ supabase, data });

    return safeRedirect(`/payroll/run-payroll/site/${data.site_id}`, { status: 303 });
}