import { updateEmployee } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { isGoodStatus, z } from "@canny_ecosystem/utils";
import { parseWithZod } from "@conform-to/zod";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";

const UpdateActiveSchema = z.object({
  id: z.string(),
  is_active: z.enum(["true", "false"]).transform((val) => val === "true"),
});

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  try {
    const formData = await request.formData();
    const returnTo = formData.get("returnTo");

    const { supabase } = getSupabaseWithHeaders({ request });

    const submission = parseWithZod(formData, {
      schema: UpdateActiveSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 }
      );
    }

    const { status, error } = await updateEmployee({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: `Employee marked as ${
          submission.value.is_active ? "active" : "inactive"
        }`,
        returnTo,
        error: null,
      });
    }
    return json({
      status: "error",
      message: "Employee update failed",
      error,
      returnTo,
    });
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      error,
    });
  }
}

export default function UpdateActive() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        toast({
          title: "Success",
          description: actionData?.message || "Employee updated",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: actionData?.error?.message || "Employee update failed",
          variant: "destructive",
        });
      }
      navigate(actionData?.returnTo ?? "/employees");
    }
  }, [actionData]);

  return null;
}
