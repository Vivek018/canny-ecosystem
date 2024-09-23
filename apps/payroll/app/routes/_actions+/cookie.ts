import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { safeRedirect } from "@/utils/server/http.server";
import { setTheme } from "@/utils/server/theme.server";
import type { Theme } from "@canny_ecosystem/types";
import { setCompanyId } from "@/utils/server/company.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return safeRedirect(request.headers.get("Referer") ?? "/", { status: 303 });
}

export async function action({ request }: ActionFunctionArgs) {
  try {
  const formData = await request.formData();
  const theme = formData.get("theme");
  const companyId = formData.get("companyId")?.toString();

  let cookieValue: string | undefined;

  switch (true) {
    case !!companyId:
      cookieValue = setCompanyId(companyId);
      break;
    case !!theme:
      cookieValue = setTheme(theme as Theme);
      break;
    default:
      break;
  }

  return safeRedirect(
    formData.get("returnTo"),
    cookieValue
      ? {
          headers: {
            "set-cookie": cookieValue,
          },
        }
      : {},
  );
} catch (error) {
  console.error(error);
  return safeRedirect("/", { status: 500 });
}
}
