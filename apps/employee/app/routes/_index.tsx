import { safeRedirect } from "@/utils/server/http.server";
import { getSessionUser } from "@canny_ecosystem/supabase/cached-queries";
import type { MetaFunction } from "@remix-run/node";
import type { LoaderFunctionArgs } from "react-router-dom";
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

  if (!(user || employeeId)) {
    return safeRedirect("/login", { status: 303 });
  }

  return safeRedirect("/employees", { status: 303 });
}
