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
  getUsers,
} from "@canny_ecosystem/supabase/queries";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import { clearCacheEntry } from "@/utils/cache";
import AddReimbursements from "../../employees+/$employeeId+/reimbursements+/add-reimbursement";

export const UPDATE_REIMBURSEMENTS_TAG = "Update_Reimbursement";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const reimbursementId = params.reimbursementId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.reimbursements}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  let reimbursementData = null;
  let error = null;

  const { data: userData, error: userError } = await getUsers({ supabase });
  if (userError || !userData) throw userError;

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
    return json({ result: submission.reply() }, { status: submission.status === "error" ? 400 : 200 });
  }

  const { status, error } = await updateReimbursementsById({
    reimbursementId: reimbursementId!,
    supabase,
    data: submission.value,
  });

  if (isGoodStatus(status)) {
    return json({ status: "success", message: "Employee reimbursement updated successfully", error: null });
  }

  return json({ status: "error", message: "Employee reimbursement update failed", error });
}

export default function UpdateReimbursements() {
  const { data, userOptions, reimbursementId, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const updatableData = data;

  const { toast } = useToast();
  const navigate = useNavigate();
  const { employeeId } = useParams();

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
        toast({
          title: "Success",
          description: actionData?.message || "Reimbursement updated successfully",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.error?.message || "Failed to update reimbursement",
          variant: "destructive",
        });
      }
      navigate(`/employees/${employeeId}/reimbursements`);
    }
  }, [actionData]);

  return <AddReimbursements
    updateValues={updatableData}
    userOptionsFromUpdate={userOptions}
    reimbursementId={reimbursementId}
  />
}
