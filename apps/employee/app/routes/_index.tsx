import { safeRedirect } from "@/utils/server/http.server";
import { getSessionUser } from "@canny_ecosystem/supabase/cached-queries";
import type { MetaFunction } from "@remix-run/node";
import { type LoaderFunctionArgs, Outlet, } from "react-router-dom";
import { getEmployeeIdFromCookie } from "@/utils/server/user.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Canny Employee" },
    { name: "description", content: "Welcome to Canny Employee!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { user } = await getSessionUser({ request });
  const employeeId = await getEmployeeIdFromCookie(request);

  if (employeeId) {
    return safeRedirect(`/employees/${employeeId}/overview`, { status: 303 });
  }

  if (!user) {
    return safeRedirect("/choose-role", { status: 303 });
  }

  return safeRedirect("/employees", { status: 303 });
}



export default function IndexRoute() {

  return <div className="px-4">
    <Outlet />
  </div>;
}
