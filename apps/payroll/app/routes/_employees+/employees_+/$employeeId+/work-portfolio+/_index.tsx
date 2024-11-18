import { EmployeeProjectAssignmentCard } from "@/components/employees/work-portfolio/project-assignment-card";
import { EmployeeSkillsCard } from "@/components/employees/work-portfolio/skills-card";
import { EmployeeWorkHistoriesCard } from "@/components/employees/work-portfolio/work-history-card";
import {
  getEmployeeProjectAssignmentByEmployeeId,
  getEmployeeSkillsByEmployeeId,
  getEmployeeWorkHistoriesByEmployeeId,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const employeeId = params.employeeId;

  const { supabase } = getSupabaseWithHeaders({ request });

  const { data: employeeProjectAssignment } =
    await getEmployeeProjectAssignmentByEmployeeId({
      supabase,
      employeeId: employeeId ?? "",
    });

  const { data: employeeWorkHistories } =
    await getEmployeeWorkHistoriesByEmployeeId({
      supabase,
      employeeId: employeeId ?? "",
    });

  const { data: employeeSkills } = await getEmployeeSkillsByEmployeeId({
    supabase,
    employeeId: employeeId ?? "",
  });

  return json({
    employeeProjectAssignment,
    employeeWorkHistories,
    employeeSkills,
  });
}

export default function WorkPortfolio() {
  const { employeeProjectAssignment, employeeWorkHistories, employeeSkills } =
    useLoaderData<typeof loader>();
  return (
    <div className="w-full my-8 flex flex-col gap-8">
      <EmployeeProjectAssignmentCard
        projectAssignment={employeeProjectAssignment}
      />
      <EmployeeWorkHistoriesCard
        employeeWorkHistories={employeeWorkHistories}
      />
      <EmployeeSkillsCard employeeSkills={employeeSkills} />
    </div>
  );
}
