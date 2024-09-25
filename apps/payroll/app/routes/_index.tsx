import { safeRedirect } from "@/utils/server/http.server";
import { getSessionUser } from "@canny_ecosystem/supabase/cached-queries";
import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Canny Payroll" },
    { name: "description", content: "Welcome to Canny Payroll!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { user } = await getSessionUser({ request });

  if (!user) {
    return safeRedirect("/sign-in");
  }

  return json({});
}

export default function Index() {
  return null;
}
