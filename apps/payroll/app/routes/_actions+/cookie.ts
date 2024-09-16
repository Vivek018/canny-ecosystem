import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { safeRedirect } from "@/utils/server/http.server";
import { setTheme } from "@/utils/server/theme.server";
import type { Theme } from "@canny_ecosystem/types";

export async function loader({ request }: LoaderFunctionArgs) {
  return safeRedirect(request.headers.get("Referer") ?? "/", { status: 303 });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const theme = formData.get("theme");

  return safeRedirect(formData.get("returnTo"), {
    headers: {
      "set-cookie": setTheme(theme as Theme | "system"),
    },
  });
}
