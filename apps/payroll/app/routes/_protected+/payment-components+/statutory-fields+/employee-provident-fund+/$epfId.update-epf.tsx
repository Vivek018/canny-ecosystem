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
  EmployeeProvidentFundSchema,
  isGoodStatus,
} from "@canny_ecosystem/utils";
import { getEmployeeProvidentFundById } from "@canny_ecosystem/supabase/queries";
import { updateEmployeeProvidentFund } from "@canny_ecosystem/supabase/mutations";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import CreateEmployeeProvidentFund from "./create-employee-provident-fund";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { useEffect } from "react";

export const UPDATE_EMPLOYEE_PROVIDENT_FUND = "update-employee-provident-fund";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const epfId = params.epfId;
  const { supabase } = getSupabaseWithHeaders({ request });

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  let epfData = null;

  if (epfId) {
    epfData = await getEmployeeProvidentFundById({
      supabase,
      id: epfId,
    });
  }

  if (epfData?.error) {
    return json({
      status: "error",
      message: "Failed to load data",
      data: epfData?.data,
      error: epfData.error,
      companyId,
    });
  }

  return json({
    status: "success",
    message: "Employee Provident Fund",
    data: epfData?.data,
    companyId,
    error: null,
  });
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
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
      navigate(-1);
    }
    if (actionData) {
      if (actionData?.status === "success") {
        toast({
          title: "Success",
          description: actionData?.message || "Employee Provident Fund updated",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message ||
            "Employee Provident Fund update failed",
          variant: "destructive",
        });
      }
      navigate(-1);
    }
  }, [actionData]);
  
  return <CreateEmployeeProvidentFund updateValues={data} />;
}
