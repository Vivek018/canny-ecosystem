import { safeRedirect } from "@/utils/server/http.server";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ params }: LoaderFunctionArgs) {
  const employeeId = params.employeeId;
  return safeRedirect(`/employees/${employeeId}/overview`);
}
