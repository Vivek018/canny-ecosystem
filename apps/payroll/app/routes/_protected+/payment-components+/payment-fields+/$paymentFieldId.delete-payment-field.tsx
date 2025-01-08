import { deletePaymentField } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { isGoodStatus } from "@canny_ecosystem/utils";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, useActionData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const paymentFieldId = params.paymentFieldId;

    const { status, error } = await deletePaymentField({
      supabase,
      id: paymentFieldId ?? "",
    });

    if (isGoodStatus(status))
      return json({
        status: "success",
        message: "Payment Field deleted",
        error: null,
      });

    return json(
      {
        status: "error",
        message: "Payment Field delete failed",
        error,
      },
      { status: 500 },
    );
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
      },
      { status: 500 },
    );
  }
}

export default function DeletePaymentField() {
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
            actionData?.error?.message || "Payment Field delete failed",
          variant: "destructive",
        });
      }
    }
    navigate("/payment-components/payment-fields", { replace: true });
  }, [actionData, toast, navigate]);
  return null;
}
