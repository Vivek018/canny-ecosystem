import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import {
  EmployeeWorkHistorySchema,
  isGoodStatus,
} from "@canny_ecosystem/utils";
import { getEmployeeWorkHistoryById } from "@canny_ecosystem/supabase/queries";
import { updateEmployeeWorkHistory } from "@canny_ecosystem/supabase/mutations";
import AddEmployeeWorkHistory from "./add-work-history";
import { useEffect } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";

export const UPDATE_EMPLOYEE_WORK_HISTORY = "update-employee-work-history";

export async function loader({
  request,
  params,
}: LoaderFunctionArgs): Promise<Response> {
  const workHistoryId = params.workHistoryId;
  let workHistoryData = null;

  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    if (workHistoryId) {
      workHistoryData = await getEmployeeWorkHistoryById({
        supabase,
        id: workHistoryId,
      });
    }

    if (workHistoryData?.error) {
      return json(
        {
          status: "error",
          message: "Failed to get employee work history",
          error: workHistoryData.error,
          data: workHistoryData.data,
        },
        { status: 500 },
      );
    }

    return json({
      status: "success",
      message: "Employee work history found",
      data: workHistoryData?.data,
      error: null,
    });
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      data: null,
      error,
    });
  }
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();

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
      return json({
        status: "success",
        message: "Successfully updated employee work history",
        error: null,
      });
    }
    return json({
      status: "error",
      message: "Failed to update employee work history",
      error,
    });
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      data: null,
      error,
    });
  }
}

export default function UpdateEmployeeWorkHistory() {
  const { data, status, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "error") {
      toast({
        title: "Error",
        description: error?.message || "Failed to load",
        variant: "destructive",
      });
      navigate(`/employees/${data?.employeeId}/work-portfolio`);
    }
    if (actionData) {
      if (actionData?.status === "success") {
        toast({
          title: "Success",
          description: actionData?.message || "Employee work history updated",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.error?.message || "Failed to update",
          variant: "destructive",
        });
      }
      navigate(`/employees/${data?.employeeId}/work-portfolio`);
    }
  }, [actionData]);

  return <AddEmployeeWorkHistory updateValues={data} />;
}
