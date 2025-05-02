import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry, clearExactCacheEntry } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { updateEmployee } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import {
  hasPermission,
  isGoodStatus,
  updateRole,
  z,
} from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import { parseWithZod } from "@conform-to/zod";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useNavigate, useParams } from "@remix-run/react";
import { useEffect } from "react";

const UpdateActiveSchema = z.object({
  id: z.string(),
  is_active: z.enum(["true", "false"]).transform((val) => val === "true"),
});

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${updateRole}:${attribute.employees}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  try {
    const formData = await request.formData();
    const returnTo = formData.get("returnTo");

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
  const { employeeId } = useParams();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(cacheKeyPrefix.employees);
        clearExactCacheEntry(
          `${cacheKeyPrefix.employee_overview}${employeeId}`
        );
        toast({
          title: "Success",
          description: actionData?.message || "Employee updated",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message ||
            actionData?.error ||
            "Employee update failed",
          variant: "destructive",
        });
      }
      navigate(actionData?.returnTo ?? "/employees");
    }
  }, [actionData]);

  return null;
}
