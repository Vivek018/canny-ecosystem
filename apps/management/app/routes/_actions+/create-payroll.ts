import { DEFAULT_ROUTE } from "@/constant";
import { safeRedirect } from "@/utils/server/http.server";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  return safeRedirect(request.headers.get("Referer") ?? "/", { status: 303 });
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();

    
  } catch (error) {
    console.error("Create Payroll", error);
    return safeRedirect(DEFAULT_ROUTE, { status: 500 });
  }
}
