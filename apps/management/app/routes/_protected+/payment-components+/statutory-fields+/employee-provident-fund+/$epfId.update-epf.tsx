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
import {
  EmployeeProvidentFundSchema,
  hasPermission,
  isGoodStatus,
  updateRole,
} from "@canny_ecosystem/utils";
import { getEmployeeProvidentFundById } from "@canny_ecosystem/supabase/queries";
import { updateEmployeeProvidentFund } from "@canny_ecosystem/supabase/mutations";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import CreateEmployeeProvidentFund from "./create-employee-provident-fund";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { Suspense, useEffect } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import type { EmployeeAddressDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { safeRedirect } from "@/utils/server/http.server";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { attribute } from "@canny_ecosystem/utils/constant";
import { clearExactCacheEntry } from "@/utils/cache";

export const UPDATE_EMPLOYEE_PROVIDENT_FUND = "update-employee-provident-fund";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const epfId = params.epfId;
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(user?.role!, `${updateRole}:${attribute.statutoryFieldsEpf}`)
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  try {
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    let epfPromise = null;

    if (epfId) {
      epfPromise = getEmployeeProvidentFundById({
        supabase,
        id: epfId,
      });
    }

    return defer({
      epfPromise,
      companyId,
      error: null,
    });
  } catch (error) {
    return json(
      {
        error,
        epfPromise: null,
        companyId: null,
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
      schema: EmployeeProvidentFundSchema,
    });

    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }

    const { status, error } = await updateEmployeeProvidentFund({
      supabase,
      data: submission.value,
    });

    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Employee Provident Fund updated",
        error: null,
      });
    }

    return json({
      status: "error",
      message: "Failed to update Employee Provident Fund",
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

export default function UpdateEmployeeProvidentFund() {
  const { epfPromise, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;
    if (actionData?.status === "success") {
      clearExactCacheEntry(cacheKeyPrefix.statutory_field_epf);
      toast({
        title: "Success",
        description: actionData?.message || "Employee Provident Fund updated",
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description:
          actionData?.error?.message || "Employee Provident Fund update failed",
        variant: "destructive",
      });
    }
    navigate("/payment-components/statutory-fields/employee-provident-fund");
  }, [actionData]);

  if (error)
    return <ErrorBoundary error={error} message="Failed to load EPF" />;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={epfPromise}>
        {(resolvedData) => {
          if (!resolvedData)
            return <ErrorBoundary message="Failed to load EPF" />;
          return (
            <UpdateEPFWrapper
              data={resolvedData.data}
              error={resolvedData.error}
            />
          );
        }}
      </Await>
    </Suspense>
  );
}

export function UpdateEPFWrapper({
  data,
  error,
}: {
  data: EmployeeAddressDatabaseUpdate | null;
  error: Error | null | { message: string };
}) {
  const { toast } = useToast();

  useEffect(() => {
    if (error)
      toast({
        title: "Error",
        description: error?.message || "Failed to load EPF",
        variant: "destructive",
      });
  }, [error]);

  return <CreateEmployeeProvidentFund updateValues={data} />;
}
