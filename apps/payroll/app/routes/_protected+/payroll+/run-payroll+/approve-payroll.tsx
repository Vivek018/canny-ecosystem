import type { ActionFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { safeRedirect } from "@/utils/server/http.server";
import { approvePayrollById } from "@canny_ecosystem/supabase/mutations";

export async function action({ request }: ActionFunctionArgs) {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();
    const stringData = formData.get('data') as string;
    const parsedData = JSON.parse(stringData);

    await approvePayrollById({ supabase, payrollId: parsedData.payrollId });

    return safeRedirect("/payroll/run-payroll", { status: 303 });
}