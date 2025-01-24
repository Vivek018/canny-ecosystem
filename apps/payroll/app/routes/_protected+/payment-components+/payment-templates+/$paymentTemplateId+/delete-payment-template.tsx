import { DEFAULT_ROUTE } from "@/constant";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { deletePaymentTemplate } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import {
  deleteRole,
  hasPermission,
  isGoodStatus,
} from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, useActionData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${deleteRole}:${attribute.paymentTemplates}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    const paymentTemplateId = params.paymentTemplateId;

    const { status, error } = await deletePaymentTemplate({
      supabase,
      id: paymentTemplateId ?? "",
    });

    if (isGoodStatus(status))
      return json({
        status: "success",
        message: "Payment Template deleted",
        error: null,
      });

    return json(
      {
        status: "error",
        message: "Payment Template Delete Failed",
        error,
      },
      { status: 500 }
    );
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
      },
      { status: 500 }
    );
  }
}

export default function DeletePaymentTemplate() {
  const actionData = useActionData<typeof action>();

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        toast({
          title: "Success",
          description: actionData?.message,
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message || "Payment Template Delete Failed",
          variant: "destructive",
        });
      }
    }
    navigate("/payment-components/payment-templates", { replace: true });
  }, [actionData]);

  return null;
}
