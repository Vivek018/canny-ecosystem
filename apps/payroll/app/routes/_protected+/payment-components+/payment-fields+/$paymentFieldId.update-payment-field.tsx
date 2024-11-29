import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import CreatePaymentField from "./create-payment-field";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import {
  isGoodStatus,
  PaymentFieldSchema,
  paymentTypeArray,
} from "@canny_ecosystem/utils";
import { getPaymentFieldById } from "@canny_ecosystem/supabase/queries";
import { updatePaymentField } from "@canny_ecosystem/supabase/mutations";
import { useEffect } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";

export const UPDATE_PAYMENT_FIELD = "update-payment-field";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const paymentFieldId = params.paymentFieldId;
  const { supabase } = getSupabaseWithHeaders({ request });

  let paymentFieldData = null;

  if (paymentFieldId) {
    paymentFieldData = await getPaymentFieldById({
      supabase,
      id: paymentFieldId,
    });
  }

  if (paymentFieldData?.error) throw paymentFieldData.error;

  return json({ data: paymentFieldData?.data });
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: PaymentFieldSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { status, error } = await updatePaymentField({
    supabase,
    data: {
      ...submission.value,
      amount:
        submission.value.payment_type === paymentTypeArray[1]
          ? null
          : submission.value.amount,
    },
  });

  if (isGoodStatus(status))
    return json({
      status: "success",
      message: "Payment Field updated",
      error: null,
    });

  return json(
    {
      status: "error",
      message: "Payment Field update failed",
      error,
    },
    { status: 500 },
  );
}

export default function UpdatePaymentField() {
  const { data } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!actionData) return;
    if (actionData?.status === "success") {
      toast({
        title: "Success",
        description: actionData?.message,
        variant: "success",
      });

      navigate(actionData?.returnTo ?? "/payment-components/payment-fields", {
        replace: true,
      });
    } else {
      toast({
        title: "Error",
        description: actionData?.error?.message || "Payment Field update failed",
        variant: "destructive",
      });
    }
  }, [actionData, toast, navigate]);

  return <CreatePaymentField updateValues={data} />;
}
