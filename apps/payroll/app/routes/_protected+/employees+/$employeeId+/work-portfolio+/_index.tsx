import { EmployeeProjectAssignmentCard } from "@/components/employees/work-portfolio/project-assignment-card";
import { EmployeeSkillsCard } from "@/components/employees/work-portfolio/skills-card";
import { EmployeeWorkHistoriesCard } from "@/components/employees/work-portfolio/work-history-card";
import {
  getEmployeeProjectAssignmentByEmployeeId,
  getEmployeeSkillsByEmployeeId,
  getEmployeeWorkHistoriesByEmployeeId,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";

export async function loader({
  request,
  params,
}: LoaderFunctionArgs): Promise<Response> {
  const employeeId = params.employeeId;

  try {
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

    const { data: employeeSkills, error } = await getEmployeeSkillsByEmployeeId(
      {
        supabase,
        employeeId: employeeId ?? "",
      },
    );

    if (error)
      return json({
        status: "error",
        message: "Failed to get employee skills",
        error,
        employeeId,
      });

    return json({
      status: "success",
      message: "Employee skills found",
      error: null,
      employeeProjectAssignment,
      employeeWorkHistories,
      employeeSkills,
      employeeId,
    });
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      error,
      employeeId,
    });
  }
}

export default function WorkPortfolio() {
  const {
    employeeProjectAssignment,
    employeeWorkHistories,
    employeeSkills,
    status,
    message,
    employeeId,
  } = useLoaderData<typeof loader>();

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "error") {
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      navigate(`/employees/${employeeId}/work-portfolio`);
    }
  }, []);

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
