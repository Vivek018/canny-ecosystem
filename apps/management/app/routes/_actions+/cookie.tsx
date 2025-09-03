import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { setTheme } from "@/utils/server/theme.server";
import type { Theme } from "@canny_ecosystem/types";
import { setCompanyId } from "@/utils/server/company.server";
import { DEFAULT_ROUTE } from "@/constant";
import { useActionData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useToast } from "@canny_ecosystem/ui/use-toast";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const theme = formData.get("theme");
    const companyId = formData.get("companyId")?.toString();
    const returnTo = formData.get("returnTo")?.toString() || DEFAULT_ROUTE;

    let cookieValue: string | undefined;
    let updateType: string;

    switch (true) {
      case !!companyId:
        cookieValue = setCompanyId(companyId);
        updateType = "Company";
        break;
      case !!theme:
        cookieValue = setTheme(theme as Theme);
        updateType = "Theme";
        break;
      default:
        return json({
          status: "error",
          message: "No valid data provided",
          returnTo,
        });
    }

    const headers = new Headers();
    if (cookieValue) {
      headers.append("Set-Cookie", cookieValue);
    }

    return json(
      {
        status: "success",
        message: `${updateType} changed successfully`,
        returnTo,
      },
      { headers },
    );
  } catch (error) {
    console.error("Cookie", error);
    return json(
      {
        status: "error",
        message: "Failed to update settings",
        returnTo: DEFAULT_ROUTE,
      },
      { status: 500 },
    );
  }
}

export default function CookieRoute() {
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (actionData) {
      if (actionData.status === "success") {
        toast({
          title: "Success",
          description: actionData.message,
          variant: "success",
        });

        navigate(actionData.returnTo);
      } else {
        toast({
          title: "Error",
          description: actionData.message,
          variant: "destructive",
        });

        navigate(actionData.returnTo);
      }
    }
  }, [actionData, navigate, toast]);

  return (
    <div className="fixed inset-0 z-50 bg-background/80">
      <LoadingSpinner className="absolute top-1/2 -translate-y-1/2 m-0" />
    </div>
  );
}
