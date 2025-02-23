import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  json,
  useActionData,
  useLoaderData,
  useNavigate,
  useParams,
} from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import {
  hasPermission,
  isGoodStatus,
  ReimbursementSchema,
  updateRole,
} from "@canny_ecosystem/utils";
import { updateReimbursementsById } from "@canny_ecosystem/supabase/mutations";
import {
  getReimbursementsById,
  getUsersByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import AddReimbursements from "./add-reimbursement";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import { clearCacheEntry } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";

export const UPDATE_REIMBURSEMENTS_TAG = "Update_Reimbursement";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const reimbursementId = params.reimbursementId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(
      user?.role!,
      `${updateRole}:${attribute.employeeReimbursements}`
    )
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  let reimbursementData = null;

  const { data: userData, error: userError } = await getUsersByCompanyId({
    supabase,
    companyId,
  });
  if (userError || !userData) {
    throw userError;
  }

  let error = null;
  if (reimbursementId) {
    const { data, error: reimbursementError } = await getReimbursementsById({
      supabase,
      reimbursementId,
    });

    reimbursementData = data;
    error = reimbursementError;
  }
  const userOptions = userData.map((userData) => ({
    label: userData.email?.toLowerCase(),
    value: userData.id,
  }));

  return json({ data: reimbursementData, userOptions, reimbursementId, error });
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const reimbursementId = params.reimbursementId;
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: ReimbursementSchema });

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
      message: "Employee reimbursement update successfully",
      error: null,
    });
  }
  return json({
    status: "error",
    message: "Employee reimbursement update failed",
    error,
  });
}

export default function UpdateReimbursememts() {
  const { data, userOptions, reimbursementId, error } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const updatableData = data;

  const { toast } = useToast();
  const navigate = useNavigate();
  const { employeeId } = useParams();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error?.message || "Employee address update failed",
        variant: "destructive",
      });
    }
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(
          `${cacheKeyPrefix.employee_reimbursements}${employeeId}`
        );
        toast({
          title: "Success",
          description: actionData?.message || "Employee address updated",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message || "Employee address update failed",
          variant: "destructive",
        });
      }
      navigate(`/employees/${employeeId}/reimbursements`);
    }
  }, [actionData]);

  return (
    <AddReimbursements
      updateValues={updatableData}
      userOptionsFromUpdate={userOptions as any}
      reimbursementId={reimbursementId}
    />
  );
}
