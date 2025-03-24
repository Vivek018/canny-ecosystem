import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import {
  hasPermission,
  isGoodStatus,
  PaySequenceSchema,
  updateRole,
} from "@canny_ecosystem/utils";
import { updatePaySequenceById } from "@canny_ecosystem/supabase/mutations";
import { getPaySequenceById } from "@canny_ecosystem/supabase/queries";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import { clearCacheEntry } from "@/utils/cache";
import AddPaySequence from "./add-pay-sequence";

export const UPDATE_PAYSEQUENCE_TAG = "Update_paysequence";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const paySequenceId = params.id;
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.paySequence}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  let paySequenceData = null;
  let error = null;

  if (paySequenceId) {
    const { data, error: paySequenceError } = await getPaySequenceById({
      supabase,
      paySequenceId,
    });

    paySequenceData = data;
    error = paySequenceError;
  }

  return json({ data: paySequenceData, error });
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const paySequenceId = params.id!;
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: PaySequenceSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }

  const { status, error } = await updatePaySequenceById({
    paySequenceId,
    supabase,
    data: submission.value,
  });

  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Pay Sequence updated successfully",
      error: null,
    });
  }

  return json({
    status: "error",
    message: "Pay Sequence update failed",
    error,
  });
}

export default function UpdatePaySequence() {
  const { data, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const updatableData = data;

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load pay sequence data",
        variant: "destructive",
      });
    }
  }, [error]);

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(`${cacheKeyPrefix.pay_sequence}`);
        toast({
          title: "Success",
          description:
            actionData?.message || "Pay Sequence updated successfully",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message || "Failed to update pay sequence",
          variant: "destructive",
        });
      }
      navigate("/time-tracking/pay-sequence");
    }
  }, [actionData]);

  return <AddPaySequence updatableData={updatableData} />;
}
