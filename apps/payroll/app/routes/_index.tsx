import { safeRedirect } from "@/utils/server/http.server";
import { getSessionUser } from "@canny_ecosystem/supabase/cached-queries";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Canny Payroll" },
    { name: "description", content: "Welcome to Canny Payroll!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { user } = await getSessionUser({ request });

  if (!user) {
    return safeRedirect("/login", { status: 303 });
  }

  return safeRedirect("/dashboard", { status: 303 });
}
