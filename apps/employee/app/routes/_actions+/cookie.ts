import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { safeRedirect } from "@/utils/server/http.server";
import { setTheme } from "@/utils/server/theme.server";
import type { Theme } from "@canny_ecosystem/types";
import { DEFAULT_ROUTE } from "@/constant";

export async function loader({ request }: LoaderFunctionArgs) {
  return safeRedirect(request.headers.get("Referer") ?? "/", { status: 303 });
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const theme = formData.get("theme");

    let cookieValue: string | undefined;

    switch (true) {
      case !!theme:
        cookieValue = setTheme(theme as Theme);
        break;
      default:
        break;
    }

    const headers = new Headers();
    if (cookieValue) {
      headers.append("Set-Cookie", cookieValue);
    }

    return safeRedirect(formData.get("returnTo"), { headers });
  } catch (error) {
    console.error("Cookie", error);
    return safeRedirect(DEFAULT_ROUTE, { status: 500 });
  }
}
