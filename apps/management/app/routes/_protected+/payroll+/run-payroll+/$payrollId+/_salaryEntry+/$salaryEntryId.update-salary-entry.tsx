import { cacheKeyPrefix } from "@/constant";
import { clearCacheEntry, clearExactCacheEntry } from "@/utils/cache";
import { updateSalaryEntryById } from "@canny_ecosystem/supabase/mutations";

import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import {
  isGoodStatus,
  SalaryEntrySiteDepartmentSchema,
} from "@canny_ecosystem/utils";
import { parseWithZod } from "@conform-to/zod";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useNavigate, useParams } from "@remix-run/react";
import { useEffect } from "react";

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  try {
    const formData = await request.formData();

    const submission = parseWithZod(formData, {
      schema: SalaryEntrySiteDepartmentSchema,
    });

    if (submission.status !== "success") {
      return json(
        {
          status: "error",
          message: "Salary Entry update failed",
          error: submission.error,
        },
        { status: 500 },
      );
    }
    const finalData = {
      id: submission.value.id,
      site_id: submission.value.site_id ?? null,
      department_id: submission.value.department_id ?? null,
    };

    const { status, error } = await updateSalaryEntryById({
      data: finalData,
      supabase,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Salary Entry updated successfully",
        error: null,
      });
    }
    return json(
      {
        status: "error",
        message: "Salary Entry update failed",
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
        data: null,
      },
      { status: 500 },
    );
  }
}

export default function UpdateSalaryEntry() {
  const actionData = useActionData<typeof action>();
  const { payrollId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearCacheEntry(`${cacheKeyPrefix.run_payroll_id}${payrollId}`);
        clearExactCacheEntry(cacheKeyPrefix.run_payroll);
        toast({
          title: "Success",
          description: actionData?.message,
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            (actionData?.error as any)?.message || actionData?.message,
          variant: "destructive",
        });
      }
      navigate(`/payroll/run-payroll/${payrollId}`, { replace: true });
    }
  }, [actionData]);

  return null;
}
