import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { json, useLoaderData, useNavigate } from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { EmployeeSkillsSchema, isGoodStatus } from "@canny_ecosystem/utils";
import { getEmployeeSkillById } from "@canny_ecosystem/supabase/queries";
import { updateEmployeeSkill } from "@canny_ecosystem/supabase/mutations";
import AddEmployeeSkill from "./add-employee-skill";
import { useEffect } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";

export const UPDATE_EMPLOYEE_SKILL = "update-employee-skill";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const skillId = params.skillId;
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
    });
  }

  return json({
    status: "success",
    message: "Employee skill found",
    data: skillData?.data,
    error: null,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
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
    });
  }
  return json({
    status: "error",
    message: "Failed to update employee skill",
    error,
  });
}

export default function UpdateEmployeeSkill() {
  const { data, status, error } = useLoaderData<typeof loader>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "error") {
      toast({
        title: "Error",
        description: error?.message || "Failed to load",
        variant: "destructive",
      });
      navigate(-1);
    }
  }, []);

  return <AddEmployeeSkill updateValues={data} />;
}
