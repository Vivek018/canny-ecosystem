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
  EmployeeLetterSchema,
  hasPermission,
  isGoodStatus,
  updateRole,
} from "@canny_ecosystem/utils";
import { getEmployeeLetterById } from "@canny_ecosystem/supabase/queries";
import { updateEmployeeLetter } from "@canny_ecosystem/supabase/mutations";
import { useEffect } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import CreateEmployeeLetter from "../create-letter";
import { clearExactCacheEntry } from "@/utils/cache";

export const UPDATE_LETTER_TAG = "update-letter";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const employeeId = params.employeeId;
  const letterId = params.letterId;

  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(user?.role!, `${updateRole}:${attribute.employeeLetters}`)
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    let employeeLetterData = null;
    let employeeLetterError = null;

    if (letterId) {
      ({ data: employeeLetterData, error: employeeLetterError } =
        await getEmployeeLetterById({
          supabase,
          id: letterId,
        }));
    }

    if (employeeLetterError) throw employeeLetterError;

    return json({
      employeeLetterData,
      employeeId,
      letterId,
      error: null,
    });
  } catch (error) {
    return json(
      {
        error,
        employeeId,
        letterId,
        employeeLetterData: null,
      },
      { status: 500 },
    );
  }
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();
    const submission = parseWithZod(formData, { schema: EmployeeLetterSchema });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }

    const { status, error } = await updateEmployeeLetter({
      supabase,
      data: {
        ...submission.value,
      },
    });

    if (isGoodStatus(status))
      return json({
        status: "success",
        message: "Employee Letter updated",
        error: null,
      });

    return json(
      {
        status: "error",
        message: "Employee Letter update failed",
        error,
      },
      { status: 500 },
    );
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
      },
      { status: 500 },
    );
  }
}

export default function UpdateEmployeeLetter() {
  const { employeeLetterData, employeeId, error } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (error)
      toast({
        title: "Error",
        description:
          (error as Error)?.message || "Employee Letter load failed",
        variant: "destructive",
      });
    if (!actionData) return;
    if (actionData?.status === "success") {
      clearExactCacheEntry(`${cacheKeyPrefix.employee_letters}${employeeId}`);
      toast({
        title: "Success",
        description: actionData?.message,
        variant: "success",
      });
      navigate(`/employees/${employeeId}/letters`, {
        replace: true,
      });
    } else {
      toast({
        title: "Error",
        description: actionData?.error?.message ?? "Employee Letter update failed",
        variant: "destructive",
      });
    }
  }, [actionData]);

  return <CreateEmployeeLetter updateValues={employeeLetterData} />;
}
