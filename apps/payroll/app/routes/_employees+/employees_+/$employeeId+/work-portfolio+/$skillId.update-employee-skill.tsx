import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { json, useLoaderData } from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import { EmployeeSkillsSchema, isGoodStatus } from "@canny_ecosystem/utils";
import { getEmployeeSkillById } from "@canny_ecosystem/supabase/queries";
import { updateEmployeeSkill } from "@canny_ecosystem/supabase/mutations";
import AddEmployeeSkill from "./add-employee-skill";

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
    throw skillData.error;
  }

  return json({ data: skillData?.data });
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
    return safeRedirect(`/employees/${employeeId}/work-portfolio`, {
      status: 303,
    });
  }
  return json({ status, error });
}

export default function UpdateEmployeeSkill() {
  const { data } = useLoaderData<typeof loader>();
  return <AddEmployeeSkill updateValues={data} />;
}
