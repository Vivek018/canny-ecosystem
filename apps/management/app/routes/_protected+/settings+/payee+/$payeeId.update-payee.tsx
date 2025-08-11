import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import CreatePayee from "./create-payee";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import {
  hasPermission,
  isGoodStatus,
  PayeeSchema,
  updateRole,
} from "@canny_ecosystem/utils";
import { getPayeeById } from "@canny_ecosystem/supabase/queries";
import { updatePayeeById } from "@canny_ecosystem/supabase/mutations";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";

export const UPDATE_PAYEE_TAG = "update-payee";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const payeeId = params.payeeId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.settingPayee}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  try {
    let payeeData = null;
    let payeeError = null;

    if (payeeId) {
      ({ data: payeeData, error: payeeError } = await getPayeeById({
        supabase,
        id: payeeId,
      }));

      if (payeeError) throw payeeError;

      return json({
        payeeData,
        error: null,
      });
    }

    throw new Error("No identity key provided");
  } catch (error) {
    return json(
      {
        payeeData: null,
        error,
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

    const submission = parseWithZod(formData, {
      schema: PayeeSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }

    const { status, error } = await updatePayeeById({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status))
      return json({
        status: "success",
        message: "Payee updated successfully",
        error: null,
      });

    return json({
      status: "error",
      message: "Failed to update payee",
      error,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "Failed to update payee",
        error,
      },
      { status: 500 },
    );
  }
}

export default function UpdatePayee() {
  const { payeeData, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;
    if (actionData?.status === "success") {
      clearExactCacheEntry(cacheKeyPrefix.payee);
      toast({
        title: "Success",
        description: actionData?.message,
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description:
          actionData?.error?.message ||
          actionData?.error ||
          "Payee update failed",
        variant: "destructive",
      });
    }

    navigate("/settings/payee", {
      replace: true,
    });
  }, [actionData]);

  if (error)
    return <ErrorBoundary error={error} message="Failed to load payee" />;

  return <CreatePayee updateValues={payeeData} />;
}
