import { safeRedirect } from "@/utils/server/http.server";
import { getSessionUser } from "@canny_ecosystem/supabase/cached-queries";
import type { MetaFunction } from "@remix-run/node";
import { type LoaderFunctionArgs, Outlet } from "react-router-dom";

export const meta: MetaFunction = () => {
  return [
    { title: "Canny Employee" },
    { name: "description", content: "Welcome to Canny Employee!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  // const { user } = await getSessionUser({ request });

  return safeRedirect("/employees", { status: 303 });
}



export default function IndexRoute() {

  return <div className="px-4">
    <Outlet />
  </div>;
}
