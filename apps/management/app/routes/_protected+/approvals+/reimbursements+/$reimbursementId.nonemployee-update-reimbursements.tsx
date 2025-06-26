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
  NonEmployeeReimbursementSchema,
  updateRole,
} from "@canny_ecosystem/utils";
import { updateReimbursementsById } from "@canny_ecosystem/supabase/mutations";
import { getReimbursementsById } from "@canny_ecosystem/supabase/queries";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import { clearCacheEntry } from "@/utils/cache";
import AddNonEmployeeReimbursements from "./add-nonemployee-reimbursement";

export const UPDATE_NONEMPLOYEE_REIMBURSEMENTS_TAG =
  "Update_Non-Employee_Reimbursement";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const reimbursementId = params.reimbursementId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(user?.role!, `${updateRole}:${attribute.reimbursements}`)
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  let reimbursementData = null;
  let error = null;

  if (reimbursementId) {
    const { data, error: reimbursementError } = await getReimbursementsById({
      supabase,
      reimbursementId,
    });

    reimbursementData = data;
    error = reimbursementError;
  }

  return json({ data: reimbursementData, error });
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const reimbursementId = params.reimbursementId;
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: NonEmployeeReimbursementSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }

  const { status, error } = await updateReimbursementsById({
    reimbursementId: reimbursementId!,
    supabase,
    data: submission.value,
  });

  if (isGoodStatus(status)) {
    return json({
      status: "success",
      message: "Non Employee Reimbursement updated successfully",
      error: null,
    });
  }

  return json({
    status: "error",
    message: "Non Employee Reimbursement update failed",
    error,
  });
}

export default function UpdateReimbursements() {
  const { data, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const updatableData = data;

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load reimbursement data",
        variant: "destructive",
      });
    }
  }, [error]);

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(`${cacheKeyPrefix.reimbursements}`);
        clearCacheEntry(`${cacheKeyPrefix.employee_reimbursements}`);
        toast({
          title: "Success",
          description:
            actionData?.message ||
            " Non Employee Reimbursement updated successfully",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message ??
            "Non Employee Reimbursement update failed",
          variant: "destructive",
        });
      }
      navigate("/approvals/reimbursements");
    }
  }, [actionData]);

  return <AddNonEmployeeReimbursements updateValues={updatableData} />;
}
