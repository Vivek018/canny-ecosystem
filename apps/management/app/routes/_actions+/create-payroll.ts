import { DEFAULT_ROUTE } from "@/constant";
import { safeRedirect } from "@/utils/server/http.server";
import { createReimbursementPayroll } from "@canny_ecosystem/supabase/mutations";
import type { ReimbursementDataType } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  return safeRedirect(request.headers.get("Referer") ?? "/", { status: 303 });
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();
    const type = formData.get("type") as string;

    if (type === "reimbursement") {
      const reimbursementData = JSON.parse(formData.get("reimbursementData") as string) as Pick<ReimbursementDataType, "id" | "employee_id" | "amount">[];

      await createReimbursementPayroll({ supabase, data: { type, reimbursementData } })
    }

    return safeRedirect("/approvals/reimbursements", { status: 500 });
  } catch (error) {
    console.error("Create Payroll", error);
    return safeRedirect("/approvals/reimbursements", { status: 500 });
  }
}
