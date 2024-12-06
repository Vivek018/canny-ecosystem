import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import CreatePaymentField from "./create-payment-field";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Await,
  defer,
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
import { Suspense, useEffect } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { ErrorBoundary } from "@/components/error-boundary";
import type { PaymentFieldDatabaseUpdate } from "@canny_ecosystem/supabase/types";

export const UPDATE_PAYMENT_FIELD = "update-payment-field";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const paymentFieldId = params.paymentFieldId;

  try {
    const { supabase } = getSupabaseWithHeaders({ request });

    let paymentFieldPromise = null;

    if (paymentFieldId) {
      paymentFieldPromise = getPaymentFieldById({
        supabase,
        id: paymentFieldId,
      });
    }

    return defer({
      paymentFieldPromise,
      error: null,
    });
  } catch (error) {
    return json(
      {
        error,
        paymentFieldPromise: null,
      },
      { status: 500 },
    );
  }
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  try {
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

export default function UpdatePaymentField() {
  const { paymentFieldPromise } = useLoaderData<typeof loader>();
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
    } else {
      toast({
        title: "Error",
        description:
          actionData?.error?.message || "Payment Field update failed",
        variant: "destructive",
      });
    }

    navigate("/payment-components/payment-fields", {
      replace: true,
    });
  }, [actionData]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={paymentFieldPromise}>
        {(resolvedData) => {
          if (!resolvedData)
            return <ErrorBoundary message="Failed to load payment field" />;
          return (
            <UpdatePaymentFieldWrapper
              data={resolvedData?.data}
              error={resolvedData?.error}
            />
          );
        }}
      </Await>
    </Suspense>
  );
}

export function UpdatePaymentFieldWrapper({
  data,
  error,
}: {
  data: PaymentFieldDatabaseUpdate | null;
  error: Error | null | { message: string };
}) {
  const { toast } = useToast();

  useEffect(() => {
    if (error)
      toast({
        title: "Error",
        description: error?.message,
        variant: "destructive",
      });
  }, [error]);

  return (
    <>
      <CreatePaymentField updateValues={data} />
    </>
  );
}
