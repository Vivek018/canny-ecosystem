import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { json, useLoaderData } from "@remix-run/react";
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
import AddReimbursements from "../../employees+/$employeeId+/reimbursements+/add-reimbursement";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { DEFAULT_ROUTE } from "@/constant";

export const UPDATE_REIMBURSEMENTS_TAG = "Update Reimbursements";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const reimbursementId = params.reimbursementId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(`${user?.role!}`, `${updateRole}:reimbursements`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  let reimbursementData = null;

  const { data: userData, error: userError } = await getUsers({ supabase });
  if (userError || !userData) {
    throw userError;
  }

  if (reimbursementId) {
    const { data, error } = await getReimbursementsById({
      supabase,
      reimbursementId: reimbursementId,
    });

    if (error) {
      throw error;
    }

    reimbursementData = data;
  }
  const userOptions = userData.map((userData) => ({
    label: userData?.email?.toLowerCase(),
    value: userData.id,
  }));

  return json({ data: reimbursementData, userOptions, reimbursementId });
}

export async function action({ request, params }: ActionFunctionArgs) {
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
    data: submission.value as any,
  });

  if (isGoodStatus(status))
    return safeRedirect("/approvals/reimbursements", { status: 303 });

  return json({ status, error });
}

export default function UpdateReimbursememts() {
  const { data, userOptions } = useLoaderData<typeof loader>();
  const updatableData = data;

  return (
    <AddReimbursements
      updateValues={updatableData}
      userOptionsFromUpdate={userOptions}
    />
  );
}
