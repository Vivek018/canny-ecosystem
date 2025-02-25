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
  EmployeeStateInsuranceSchema,
  hasPermission,
  isGoodStatus,
  updateRole,
} from "@canny_ecosystem/utils";
import { getEmployeeStateInsuranceById } from "@canny_ecosystem/supabase/queries";
import { updateEmployeeStateInsurance } from "@canny_ecosystem/supabase/mutations";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import CreateEmployeeStateInsurance from "./create-employee-state-insurance";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";

export const UPDATE_EMPLOYEE_STATE_INSURANCE =
  "update-employee-state-insurance";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const esiId = params.esiId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(user?.role!, `${updateRole}:${attribute.statutoryFieldsEsi}`)
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  try {
    let esiData = null;
    let esiError = null;

    if (esiId) {
      ({ data: esiData, error: esiError } = await getEmployeeStateInsuranceById(
        {
          supabase,
          id: esiId,
        },
      ));
    } else {
      throw new Error("Employee State Insurance ID not provided");
    }

    if (esiError) throw esiError;

    return json({
      error: null,
      esiData,
      companyId,
    });
  } catch (error) {
    return json(
      {
        error,
        esiData: null,
        companyId,
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

    const submission = parseWithZod(formData, {
      schema: EmployeeStateInsuranceSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }

    const { status, error } = await updateEmployeeStateInsurance({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Employee State Insurance updated successfully",
        error: null,
      });
    }

    return json({
      status: "error",
      message: "Employee State Insurance update failed",
      error,
    });
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

export default function UpdateEmployeeStateInsurance() {
  const { esiData, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;
    if (actionData?.status === "success") {
      clearExactCacheEntry(cacheKeyPrefix.statutory_field_esi);
      toast({
        title: "Success",
        description: actionData?.message || "Employee State Insurance updated",
        variant: "success",
      });
      navigate("/payment-components/statutory-fields/employee-state-insurance");
    } else {
      toast({
        title: "Error",
        description:
          actionData?.error?.message ||
          "Employee State Insurance update failed",
        variant: "destructive",
      });
    }
  }, [actionData]);

  if (error)
    return <ErrorBoundary error={error} message="Failed to load ESI" />;

  return <CreateEmployeeStateInsurance updateValues={esiData} />;
}
