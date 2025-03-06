import { DEFAULT_ROUTE } from "@/constant";
import { safeRedirect } from "@/utils/server/http.server";
import type { ReimbursementDataType } from "@canny_ecosystem/supabase/queries";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  return safeRedirect(request.headers.get("Referer") ?? "/", { status: 303 });
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const type = formData.get("type") as string;

    if (type === "reimbursement") {
      const reimbursementData = JSON.parse(formData.get("reimbursementData") as string) as ReimbursementDataType[];
      
    }

    return safeRedirect("/approvals/reimbursements", { status: 500 });
  } catch (error) {
    console.error("Create Payroll", error);
    return safeRedirect(DEFAULT_ROUTE, { status: 500 });
  }
}
