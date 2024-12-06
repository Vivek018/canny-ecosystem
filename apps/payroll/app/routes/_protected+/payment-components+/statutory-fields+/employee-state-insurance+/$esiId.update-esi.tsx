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
  EmployeeStateInsuranceSchema,
  isGoodStatus,
} from "@canny_ecosystem/utils";
import { getEmployeeStateInsuranceById } from "@canny_ecosystem/supabase/queries";
import { updateEmployeeStateInsurance } from "@canny_ecosystem/supabase/mutations";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import CreateEmployeeStateInsurance from "./create-employee-state-insurance";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { Suspense, useEffect } from "react";
import type { EmployeeStateInsuranceDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { ErrorBoundary } from "@/components/error-boundary";

export const UPDATE_EMPLOYEE_STATE_INSURANCE =
  "update-employee-state-insurance";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const esiId = params.esiId;

  try {
    const { supabase } = getSupabaseWithHeaders({ request });

    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    let esiPromise = null;

    if (esiId) {
      esiPromise = getEmployeeStateInsuranceById({
        supabase,
        id: esiId,
      });
    }

    return defer({
      error: null,
      esiPromise,
      companyId,
    });
  } catch (error) {
    return json(
      {
        error,
        esiPromise: null,
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
  const { esiPromise, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) return;
    if (actionData?.status === "success") {
      toast({
        title: "Success",
        description: actionData?.message || "Employee State Insurance updated",
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description:
          actionData?.error?.message ||
          "Employee State Insurance update failed",
        variant: "destructive",
      });
    }
    navigate("/payment-components/statutory-fields/employee-state-insurance");
  }, [actionData]);

  if (error)
    return <ErrorBoundary error={error} message="Failed to load ESI" />;

  return (
    <Suspense>
      <Await resolve={esiPromise}>
        {(resolvedData) => {
          if (!resolvedData)
            return <ErrorBoundary message="Failed to load ESI" />;
          return (
            <UpdateEmployeeStateInsuranceWrapper
              data={resolvedData.data}
              error={resolvedData.error}
            />
          );
        }}
      </Await>
    </Suspense>
  );
}

export function UpdateEmployeeStateInsuranceWrapper({
  data,
  error,
}: {
  data: EmployeeStateInsuranceDatabaseUpdate | null;
  error: Error | null | { message: string };
}) {
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load ESI",
        variant: "destructive",
      });
    }
  }, [error]);

  return <CreateEmployeeStateInsurance updateValues={data} />;
}
