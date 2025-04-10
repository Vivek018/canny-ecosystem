import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import CreatePaymentField from "../create-payment-field";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  json,
  useActionData,
  useLoaderData,
  useNavigate,
  useParams,
} from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import {
  hasPermission,
  isGoodStatus,
  PaymentFieldSchema,
  paymentTypeArray,
  updateRole,
} from "@canny_ecosystem/utils";
import { getPaymentFieldById } from "@canny_ecosystem/supabase/queries";
import { updatePaymentField } from "@canny_ecosystem/supabase/mutations";
import { useEffect } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { ErrorBoundary } from "@/components/error-boundary";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearCacheEntry, clearExactCacheEntry } from "@/utils/cache";

export const UPDATE_PAYMENT_FIELD = "update-payment-field";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const paymentFieldId = params.paymentFieldId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.paymentFields}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    const { data, error } = await getPaymentFieldById({
      supabase,
      id: paymentFieldId || "",
    });

    if (error) throw error;

    return json({
      data,
      error,
    });
  } catch (error) {
    return json(
      {
        error,
        data: null,
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
  const { data, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const { paymentFieldId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!actionData) return;
    if (actionData?.status === "success") {
      clearExactCacheEntry(cacheKeyPrefix.payment_fields);
      clearCacheEntry(
        `${cacheKeyPrefix.payment_field_report}${paymentFieldId}`,
      );
      toast({
        title: "Success",
        description: actionData?.message,
        variant: "success",
      });
      navigate("/payment-components/payment-fields", {
        replace: true,
      });
    } else {
      toast({
        title: "Error",
        description:
          actionData?.error?.message || "Payment Field update failed",
        variant: "destructive",
      });
    }
  }, [actionData]);

  if (error) return <ErrorBoundary error={error} message="Failed to load" />;

  return <CreatePaymentField updateValues={data} />;
}
