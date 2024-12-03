import { updateProject } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { isGoodStatus, z } from "@canny_ecosystem/utils";
import { parseWithZod } from "@conform-to/zod";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";

const UpdateCompletedSchema = z.object({
  id: z.string(),
  actual_end_date: z.any(),
  status: z.enum(["completed", "active"]),
});

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();

    const submission = parseWithZod(formData, {
      schema: UpdateCompletedSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }

    const { status, error } = await updateProject({
      supabase,
      data: submission.value,
    });

    const returnTo = formData.get("returnTo");
    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Project updated successfully",
        returnTo,
        error: null,
      });
    }
    return json({
      status: "error",
      message: "Failed to update project",
      returnTo,
      error,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        returnTo: "/projects",
        error,
      },
      { status: 500 },
    );
  }
}

export default function UpdateCompleted() {
  const actionData = useActionData<typeof action>();

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        toast({
          title: "Success",
          description: actionData?.message,
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.error?.message || "Project update failed",
          variant: "destructive",
        });
      }
      navigate(actionData?.returnTo ?? "/projects", {
        replace: true,
      });
    }
  }, [actionData]);
  return null;
}
