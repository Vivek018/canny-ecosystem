import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { json, useLoaderData } from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import {
  EmployeeWorkHistorySchema,
  isGoodStatus,
} from "@canny_ecosystem/utils";
import { getEmployeeWorkHistoryById } from "@canny_ecosystem/supabase/queries";
import { updateEmployeeWorkHistory } from "@canny_ecosystem/supabase/mutations";
import AddEmployeeWorkHistory from "./add-work-history";

export const UPDATE_EMPLOYEE_WORK_HISTORY = "update-employee-work-history";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const workHistoryId = params.workHistoryId;
  const { supabase } = getSupabaseWithHeaders({ request });

  let workHistoryData = null;

  if (workHistoryId) {
    workHistoryData = await getEmployeeWorkHistoryById({
      supabase,
      id: workHistoryId,
    });
  }

  if (workHistoryData?.error) {
    throw workHistoryData.error;
  }

  return json({ data: workHistoryData?.data });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  const employeeId = params.employeeId;

  const submission = parseWithZod(formData, {
    schema: EmployeeWorkHistorySchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { status, error } = await updateEmployeeWorkHistory({
    supabase,
    data: submission.value,
  });

  if (isGoodStatus(status)) {
    return safeRedirect(`/employees/${employeeId}/work-portfolio`, {
      status: 303,
    });
  }
  return json({ status, error });
}

export default function UpdateEmployeeWorkHistory() {
  const { data } = useLoaderData<typeof loader>();
  return <AddEmployeeWorkHistory updateValues={data} />;
}
