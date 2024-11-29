import { updatePaymentField } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { isGoodStatus, z } from "@canny_ecosystem/utils";
import { parseWithZod } from "@conform-to/zod";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";

const UpdateActiveSchema = z.object({
  id: z.string(),
  is_active: z.enum(["true", "false"]).transform((val) => val === "true"),
});

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema: UpdateActiveSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { status, error } = await updatePaymentField({
    supabase,
    data: submission.value,
  });

  const returnTo = formData.get("returnTo");
  if (isGoodStatus(status))
    return json({
      status: "success",
      message: "Payment Field updated successfully",
      returnTo,
      error: null,
    });

  return json(
    {
      status: "error",
      message: "Payment Field update failed",
      returnTo,
      error,
    },
    { status: 500 },
  );
}

export default function UpdatePaymentFieldStatus() {
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
          description: actionData?.error?.message || "Payment Field update failed",
          variant: "destructive",
        });
      }
    }
    navigate(actionData?.returnTo ?? "/payment-components/payment-fields", {
      replace: true,
    });
  }, [actionData, toast, navigate]);

  return null;
}
