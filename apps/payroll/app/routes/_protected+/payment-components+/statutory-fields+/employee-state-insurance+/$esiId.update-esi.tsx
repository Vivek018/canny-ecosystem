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
  isGoodStatus,
} from "@canny_ecosystem/utils";
import { getEmployeeStateInsuranceById } from "@canny_ecosystem/supabase/queries";
import { updateEmployeeStateInsurance } from "@canny_ecosystem/supabase/mutations";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import CreateEmployeeStateInsurance from "./create-employee-state-insurance";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";

export const UPDATE_EMPLOYEE_STATE_INSURANCE =
  "update-employee-state-insurance";

export async function loader({
  request,
  params,
}: LoaderFunctionArgs): Promise<Response> {
  const esiId = params.esiId;
  try {
    const { supabase } = getSupabaseWithHeaders({ request });

    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    let esiData = null;

    if (esiId) {
      esiData = await getEmployeeStateInsuranceById({
        supabase,
        id: esiId,
      });
    }

    if (esiData?.error) {
      return json({
        status: "error",
        message: "Failed to load data",
        data: esiData?.data,
        error: esiData.error,
        companyId,
      });
    }

    return json({
      status: "success",
      message: "Employee State Insurance",
      error: null,
      data: esiData?.data,
      companyId,
    });
  } catch (error) {
    return json({
      status: "error",
      message: "An unexpected error occurred",
      error,
      data: null,
      companyId: null,
    }, { status: 500 });
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
    return json({
      status: "error",
      message: "An unexpected error occurred",
      error,
    }, { status: 500 });
  }
}

export default function UpdateEmployeeProvidentFund() {
  const { data, status, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "error") {
      toast({
        title: "Error",
        description: error?.message || "Failed to load",
        variant: "destructive",
      });
      navigate("/payment-components/statutory-fields/employee-state-insurance");
    }

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

  return <CreateEmployeeStateInsurance updateValues={data} />;
}
