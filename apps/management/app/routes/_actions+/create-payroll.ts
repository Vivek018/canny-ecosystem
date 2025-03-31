import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  createExitPayroll,
  createReimbursementPayroll,
} from "@canny_ecosystem/supabase/mutations";
import {
  getLinkedPaymentTemplateIdByEmployeeId,
  getPaymentTemplateById,
  getPaymentTemplateComponentsByTemplateId,
  type ExitDataType,
  type ReimbursementDataType,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { SalaryEntriesDatabaseRow } from "@canny_ecosystem/supabase/types";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { isGoodStatus } from "@canny_ecosystem/utils";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, useActionData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    const formData = await request.formData();
    const type = formData.get("type") as string;
    const failedRedirect = formData.get("failedRedirect") as string;
    let error = null;

    if (type === "salary") {
      const attendanceData = JSON.parse(
        formData.get("attendanceData") as string,
      ) as Pick<SalaryEntriesDatabaseRow, "employee_id" | "present_days" | "overtime_hours" | "month" | "year">[];
      const totalEmployees = Number.parseInt(
        formData.get("totalEmployees") as string,
      );

      const { data } = await getLinkedPaymentTemplateIdByEmployeeId({ supabase, employeeId: attendanceData[0].employee_id!, companyId });

      const { data: paymentTemplateData, error } = await getPaymentTemplateById({ supabase, id: data?.template_id! });



      if (data?.template_id) {
        const { data: paymentTemplateComponents } = await getPaymentTemplateComponentsByTemplateId({ supabase, templateId: data?.template_id });




        // const {
        //   status,
        //   error: salaryError,
        //   message,
        // } = await createSalaryPayroll({
        //   supabase,
        //   data: { type, reimbursementData, totalEmployees, totalNetAmount },
        //   companyId: companyId ?? "",
        // });

        if (isGoodStatus(status)) {
          return json({
            status: "success",
            // message: message ?? "Salary Payroll Created Successfully",
            failedRedirect,
            error: null,
          });
        }
        // error = salaryError;
      }
      return json(
        {
          status: "error",
          message: "Failed to Create Salary payroll",
          failedRedirect,
          error,
        },
      );
    }
    if (type === "reimbursement") {
      const reimbursementData = JSON.parse(
        formData.get("reimbursementData") as string,
      ) as Pick<ReimbursementDataType, "id" | "employee_id" | "amount">[];
      const totalEmployees = Number.parseInt(
        formData.get("totalEmployees") as string,
      );
      const totalNetAmount = Number.parseFloat(
        formData.get("totalNetAmount") as string,
      );

      const {
        status,
        error: reimbursementError,
        message,
      } = await createReimbursementPayroll({
        supabase,
        data: { type, reimbursementData, totalEmployees, totalNetAmount },
        companyId: companyId ?? "",
      });

      if (isGoodStatus(status)) {
        return json({
          status: "success",
          message: message ?? "Reimbursement Payroll Created Successfully",
          failedRedirect,
          error: null,
        });
      }
      error = reimbursementError;
    }
    if (type === "exit") {
      const exitData = JSON.parse(formData.get("exitData") as string) as Pick<
        ExitDataType,
        "id" | "employee_id" | "net_pay"
      >[];
      const totalEmployees = Number.parseInt(
        formData.get("totalEmployees") as string,
      );
      const totalNetAmount = Number.parseFloat(
        formData.get("totalNetAmount") as string,
      );

      const {
        status,
        error: exitError,
        message,
      } = await createExitPayroll({
        supabase,
        data: { type, exitData, totalEmployees, totalNetAmount },
        companyId: companyId ?? "",
      });

      if (isGoodStatus(status)) {
        return json({
          status: "success",
          message: message ?? "Exit Payroll Created Successfully",
          failedRedirect,
          error: null,
        });
      }
      error = exitError;
    }
    return json(
      {
        status: "error",
        message: "Failed to Create payroll",
        failedRedirect,
        error,
      },
      { status: 500 },
    );
  } catch (error) {
    console.error("Create Payroll error", error);
    return json({
      status: "error",
      message: "An unexpected error occurred in create payroll",
      failedRedirect: null,
      error,
    });
  }
}

export default function CreatePayroll() {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(cacheKeyPrefix.run_payroll);
        toast({
          title: "Success",
          description: actionData?.message || "Payroll Created",
          variant: "success",
        });
        navigate("/payroll/run-payroll");
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error ||
            actionData?.error?.message ||
            "Payroll Creation failed",
          variant: "destructive",
        });
        navigate(actionData?.failedRedirect ?? DEFAULT_ROUTE);
      }
    }
  }, [actionData]);

  return null;
}
