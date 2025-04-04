import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
import { calculateProRataAmount, getValueforEPF, getValueforESI } from "@/utils/payment";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  createExitPayroll,
  createReimbursementPayroll,
  createSalaryPayroll,
} from "@canny_ecosystem/supabase/mutations";
import {
  getLinkedPaymentTemplateIdByEmployeeId,
  getPaymentTemplateComponentsByTemplateId,
  type ExitDataType,
  type ReimbursementDataType,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { SalaryEntriesDatabaseRow } from "@canny_ecosystem/supabase/types";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { ESI_EMPLOYEE_CONTRIBUTION, isGoodStatus } from "@canny_ecosystem/utils";
import { BONUS_PERCENTAGE, EMPLOYEE_EPF_PERCENTAGE } from "@canny_ecosystem/utils/constant";
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

      const salaryEntries: Omit<SalaryEntriesDatabaseRow, "id" | "created_at" | "updated_at" | "payroll_id">[] = [];

      let epfField = null;
      let esiField = null;
      let ptField = null;
      let lwfField = null;
      let bonusField = null;
      const uniqueEmployeeIds = new Set<string>();

      for (const attendance of attendanceData) {
        const { employee_id, present_days, overtime_hours, month, year } = attendance;

        if (!employee_id || !month || !year || !present_days) {
          continue;
        }

        uniqueEmployeeIds.add(employee_id);

        const { data: linkedPaymentTemplate } = await getLinkedPaymentTemplateIdByEmployeeId({
          supabase,
          employeeId: employee_id,
          companyId,
        });

        if (!linkedPaymentTemplate?.template_id) {
          continue;
        }

        const { data: paymentTemplateComponents } = await getPaymentTemplateComponentsByTemplateId({
          supabase,
          templateId: linkedPaymentTemplate.template_id,
        });

        if (!paymentTemplateComponents) {
          continue;
        }

        for (const component of paymentTemplateComponents) {
          let amount = component.calculation_value ?? 0;

          if (component.target_type === "epf") {
            epfField = component.employee_provident_fund;
          }
          if (component.target_type === "esi") {
            esiField = component.employee_state_insurance;
          }
          if (component.target_type === "pt") {
            ptField = component.professional_tax;
          }
          if (component.target_type === "lwf") {
            lwfField = component.labour_welfare_fund;
          }
          if (component.target_type === "bonus") {
            bonusField = component.statutory_bonus;
          }

          if (component.target_type === "payment_field" && component.payment_fields?.is_pro_rata) {
            const baseAmount = component.calculation_value ?? 0;
            const totalWorkingDays = 26;
            const overtimeRate = 1;
            amount = calculateProRataAmount({ baseAmount, presentDays: present_days, totalWorkingDays, overtimeHours: overtime_hours ?? 0, overtimeRate });
          }

          salaryEntries.push({
            month,
            year,
            present_days,
            overtime_hours: overtime_hours ?? 0,
            employee_id,
            template_component_id: component.id,
            field_name: component.target_type === "payment_field" ? component.payment_fields?.name : (component.target_type.toUpperCase() ?? component.component_type),
            status: "pending",
            type: component.component_type,
            is_pro_rata: component.payment_fields?.is_pro_rata ?? false,
            consider_for_epf: component.payment_fields?.consider_for_epf ?? false,
            consider_for_esic: component.payment_fields?.consider_for_esic ?? false,
            amount,
          });
        }
      }

      const totalEmployees = uniqueEmployeeIds.size ?? 0;

      let grossValue = 0;
      let basicValue = 0;
      let valueForEPF = 0;
      let valueForESIC = 0;

      for (const entry of salaryEntries) {
        if (entry.type === "earning") {
          grossValue += entry.amount;
        }
        if (entry.field_name.toLowerCase() === "basic") {
          basicValue = entry.amount;
        }
        if (entry.consider_for_epf) {
          if (entry.type === "earning") {
            valueForEPF += entry.amount;
          }
          else if (entry.type === "deduction") {
            valueForEPF -= entry.amount;
          }
        }
        if (entry.consider_for_esic) {
          if (entry.type === "earning") {
            valueForESIC += entry.amount;
          }
          else if (entry.type === "deduction") {
            valueForESIC -= entry.amount;
          }
        }
      }

      const salaryData = salaryEntries.map((entry) => {
        if (entry.type === "statutory_contribution" || entry.type === "earning" || entry.type === "bonus") {
          let amount = null;
          if (entry.field_name.toLowerCase().includes("pf")) {
            amount = Number.parseFloat((getValueforEPF({
              epf: epfField!, values: {
                valueForEPF
              }
            }) * (epfField?.employee_contribution ?? EMPLOYEE_EPF_PERCENTAGE)).toFixed(3));
          }
          else if (entry.field_name.toLowerCase().includes("esi")) {
            amount = Number.parseFloat((getValueforESI({
              esi: esiField!, values: {
                valueForESIC
              }
            }) * (esiField?.employee_contribution ?? ESI_EMPLOYEE_CONTRIBUTION)).toFixed(3));
          }
          else if (entry.field_name.toLowerCase().includes("pt")) {
            for (const range of JSON.parse(ptField?.gross_salary_range as string)) {
              if (range.start <= grossValue && grossValue <= range.end) {
                amount = range.value;
                break;
              }
            }
          }
          else if (entry.field_name.toLowerCase().includes("lwf")) {
            if (lwfField?.deduction_cycle === "monthly") {
              amount = lwfField?.employee_contribution ?? 0;
            } else if (lwfField?.deduction_cycle === "yearly") {
              amount = (lwfField?.employee_contribution ?? 0) / 12;
            } else if (lwfField?.deduction_cycle === "half_yearly") {
              amount = (lwfField?.employee_contribution ?? 0) / 6;
            } else if (lwfField?.deduction_cycle === "quarterly") {
              amount = (lwfField?.employee_contribution ?? 0) / 3;
            }
          }
          else if (entry.field_name.toLowerCase() === "bonus" || entry.field_name.toLowerCase() === "statutory_bonus") {
            amount = Number.parseFloat((((bonusField?.percentage ?? BONUS_PERCENTAGE) * basicValue) / 100).toFixed(3));
          }
          return { ...entry, amount: amount ?? entry.amount };
        }
        return entry;
      })

      let totalNetAmount = 0;

      for (const entry of salaryData) {
        if (entry.type === "earning") {
          totalNetAmount += entry.amount;
        }
        else if (entry.type === "deduction") {
          totalNetAmount -= entry.amount;
        }
        else if (entry.type === "statutory_contribution") {
          totalNetAmount -= entry.amount;
        }
        else if (entry.type === "bonus") {
          totalNetAmount += entry.amount;
        }
      }

      const {
        status,
        error: salaryError,
        message,
      } = await createSalaryPayroll({
        supabase,
        data: { type: "salary", salaryData, totalEmployees, totalNetAmount },
        companyId: companyId ?? "",
      });

      if (isGoodStatus(status)) {
        return json({
          status: "success",
          message: message ?? "Salary Payroll Created Successfully",
          failedRedirect,
          error: null,
        });
      }

      error = salaryError;
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
