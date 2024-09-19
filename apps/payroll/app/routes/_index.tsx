import { safeRedirect } from "@/utils/server/http.server";
import { getAuthUser } from "@canny_ecosystem/supabase/cached-queries";
import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { user } = await getAuthUser({ request });

  if (!user) {
    return safeRedirect("/sign-in");
  }

  return json({});
}

export default function Index() {
  return null;
}
