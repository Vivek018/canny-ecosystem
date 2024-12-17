import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Await,
  defer,
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
import { Suspense, useEffect } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { ErrorBoundary } from "@/components/error-boundary";
import type { EmployeeSkillDatabaseUpdate } from "@canny_ecosystem/supabase/types";

export const UPDATE_EMPLOYEE_SKILL = "update-employee-skill";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const skillId = params.skillId;
  const employeeId = params.employeeId;

  try {
    const { supabase } = getSupabaseWithHeaders({ request });

    let skillPromise = null;

    if (skillId) {
      skillPromise = getEmployeeSkillById({
        supabase,
        id: skillId,
      });
    }

    return defer({
      skillPromise,
      employeeId,
      error: null,
    });
  } catch (error) {
    return json({
      error,
      employeeId,
      skillPromise: null,
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
      status: "success",
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
  const { skillPromise, error, employeeId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
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

  if (error)
    return (
      <ErrorBoundary
        error={error}
        message="Failed to load employee skills data"
      />
    );

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={skillPromise}>
        {(resolvedData) => {
          if (!resolvedData)
            return (
              <ErrorBoundary message="Failed to load employee skills data" />
            );
          return (
            <UpdateEmployeeSkillWrapper
              data={resolvedData?.data}
              error={resolvedData?.error}
            />
          );
        }}
      </Await>
    </Suspense>
  );
}

export function UpdateEmployeeSkillWrapper({
  data,
  error,
}: {
  data: EmployeeSkillDatabaseUpdate | null;
  error: Error | null | { message: string };
}) {
  if (error)
    return (
      <ErrorBoundary
        error={error}
        message="Failed to load employee skills data"
      />
    );
  return <AddEmployeeSkill updateValues={data} />;
}
