import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { safeRedirect } from "@/utils/server/http.server";
import { setTheme } from "@/utils/server/theme.server";
import type { Theme } from "@canny_ecosystem/types";
import { setCompanyId } from "@/utils/server/company.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return safeRedirect(request.headers.get("Referer") ?? "/", { status: 303 });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const theme = formData.get("theme");
  const companyId = formData.get("companyId");

  let setCookieValue: string | undefined;

  switch (true) {
    case !!companyId:
      setCookieValue = setCompanyId(companyId as string);
      break;
    case !!theme:
      setCookieValue = setTheme(theme as Theme);
      break;
    default:
      break;
  }

  return safeRedirect(
    formData.get("returnTo"),
    setCookieValue
      ? {
          headers: {
            "set-cookie": setCookieValue,
          },
        }
      : {},
  );
}
