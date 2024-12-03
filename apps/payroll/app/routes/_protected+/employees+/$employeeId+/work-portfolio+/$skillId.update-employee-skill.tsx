import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  json,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { EmployeeSkillsSchema, isGoodStatus } from "@canny_ecosystem/utils";
import { getEmployeeSkillById } from "@canny_ecosystem/supabase/queries";
import { updateEmployeeSkill } from "@canny_ecosystem/supabase/mutations";
import AddEmployeeSkill from "./add-employee-skill";
import { useEffect } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";

export const UPDATE_EMPLOYEE_SKILL = "update-employee-skill";

export async function loader({ request, params }: LoaderFunctionArgs): Promise<Response> {
  const skillId = params.skillId;
  const employeeId = params.employeeId;

  try {
    const { supabase } = getSupabaseWithHeaders({ request });

    let skillData = null;

    if (skillId) {
      skillData = await getEmployeeSkillById({
        supabase,
        id: skillId,
      });
    }

    if (skillData?.error) {
      return json({
        status: "error",
        message: "Failed to get employee skill",
        error: skillData.error,
        data: skillData.data,
        employeeId,
      });
    }

    return json({
      status: "success",
      message: "Employee skill found",
      data: skillData?.data,
      error: null,
      employeeId,
    });
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      error,
      data: null,
      employeeId,
    });
  }
}

export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  const employeeId = params.employeeId;

  const submission = parseWithZod(formData, {
    schema: EmployeeSkillsSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { status, error } = await updateEmployeeSkill({
    supabase,
    data: submission.value,
  });

  if (isGoodStatus(status)) {
    return json({
      status,
      message: "Successfully updated employee skill",
      error: null,
      employeeId,
    });
  }
  return json({
    status: "error",
    message: "Failed to update employee skill",
    error,
    employeeId,
  });
}

export default function UpdateEmployeeSkill() {
  const { data, status, error, employeeId } = useLoaderData<typeof loader>();
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
      navigate(`/employees/${employeeId}/work-portfolio`);
    }

    if (actionData) {
      if (actionData?.status === "success") {
        toast({
          title: "Success",
          description: actionData?.message,
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.error?.message || "Failed to update",
          variant: "destructive",
        });
      }
      navigate(`/employees/${employeeId}/work-portfolio`);
    }
  }, [actionData]);

  return <AddEmployeeSkill updateValues={data} />;
}
