import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearExactCacheEntry } from "@/utils/cache";
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
import {
  calculateSalaryTotalNetAmount,
  calculateProRataAmount,
  getValueforEPF,
  getValueforESI,
  ESI_EMPLOYEE_CONTRIBUTION,
  isGoodStatus,
} from "@canny_ecosystem/utils";
import {
  BONUS_PERCENTAGE,
  EMPLOYEE_EPF_PERCENTAGE,
} from "@canny_ecosystem/utils/constant";
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
    const from = (await formData.get("from")) as string;
    const payrollTitle = formData.get("title") as string;
    const skipped = formData.get("skipped") as string;
    const type = formData.get("type") as string;
    const failedRedirect = formData.get("failedRedirect") as string;
    let error = null;

    if (type === "salary") {
      const attendanceData = JSON.parse(
        formData.get("attendanceData") as string
      ) as Pick<
        SalaryEntriesDatabaseRow,
        "employee_id" | "present_days" | "overtime_hours" | "month" | "year"
      >[];

      const allSalaryEntries: Omit<
        SalaryEntriesDatabaseRow,
        "id" | "created_at" | "updated_at" | "payroll_id"
      >[] = [];

      const uniqueEmployeeIds = new Set<string>();

      for (const attendance of attendanceData) {
        const { employee_id, present_days, overtime_hours, month, year } =
          attendance;

        if (!employee_id || !month || !year || !present_days) continue;

        uniqueEmployeeIds.add(employee_id);

        const { data: linkedPaymentTemplate } =
          await getLinkedPaymentTemplateIdByEmployeeId({
            supabase,
            employeeId: employee_id,
            companyId,
          });

        if (!linkedPaymentTemplate?.template_id) continue;

        const { data: paymentTemplateComponents } =
          await getPaymentTemplateComponentsByTemplateId({
            supabase,
            templateId: linkedPaymentTemplate.template_id,
          });

        if (!paymentTemplateComponents) continue;

        const employeeSalaryEntries = [];

        let epfField = null;
        let esiField = null;
        let ptField = null;
        let lwfField = null;
        let bonusField = null;

        for (const component of paymentTemplateComponents) {
          let amount = component.calculation_value ?? 0;

          if (component.target_type === "epf")
            epfField = component.employee_provident_fund;
          if (component.target_type === "esi")
            esiField = component.employee_state_insurance;
          if (component.target_type === "pt")
            ptField = component.professional_tax;
          if (component.target_type === "lwf")
            lwfField = component.labour_welfare_fund;
          if (component.target_type === "bonus")
            bonusField = component.statutory_bonus;

          if (
            component.target_type === "payment_field" &&
            component.payment_fields?.is_pro_rata
          ) {
            const baseAmount = component.calculation_value ?? 0;
            const totalWorkingDays = 26;
            const overtimeRate = 1;
            amount = calculateProRataAmount({
              baseAmount,
              presentDays: present_days,
              totalWorkingDays,
              overtimeHours: overtime_hours ?? 0,
              overtimeRate,
            });
          }

          employeeSalaryEntries.push({
            month,
            year,
            present_days,
            overtime_hours: overtime_hours ?? 0,
            employee_id,
            template_component_id: component.id,
            field_name:
              component.target_type === "payment_field"
                ? component.payment_fields?.name
                : component.target_type.toUpperCase() ??
                  component.component_type,
            type: component.component_type,
            is_pro_rata: component.payment_fields?.is_pro_rata ?? false,
            consider_for_epf:
              component.payment_fields?.consider_for_epf ?? false,
            consider_for_esic:
              component.payment_fields?.consider_for_esic ?? false,
            amount,
            is_overtime:
              component.target_type === "payment_field"
                ? component.payment_fields?.is_overtime ?? false
                : false,
          });
        }

        let grossValue = 0;
        let basicValue = 0;
        let valueForEPF = 0;
        let valueForESIC = 0;

        for (const entry of employeeSalaryEntries) {
          if (entry.type === "earning") grossValue += entry.amount;
          if (entry.field_name.toLowerCase() === "basic")
            basicValue = entry.amount;
          if (entry.consider_for_epf) {
            valueForEPF +=
              entry.type === "earning" ? entry.amount : -entry.amount;
          }
          if (entry.consider_for_esic) {
            valueForESIC +=
              entry.type === "earning" ? entry.amount : -entry.amount;
          }
        }

        const calculatedEntries = employeeSalaryEntries.map((entry) => {
          if (
            entry.type === "statutory_contribution" ||
            entry.type === "earning" ||
            entry.type === "bonus"
          ) {
            let amount = null;
            const field = entry.field_name.toLowerCase();
            if (field.includes("pf")) {
              amount = Number.parseFloat(
                (
                  getValueforEPF({ epf: epfField!, values: { valueForEPF } }) *
                  (epfField?.employee_contribution ?? EMPLOYEE_EPF_PERCENTAGE)
                ).toFixed(3)
              );
            } else if (field.includes("esi")) {
              amount = Number.parseFloat(
                (
                  getValueforESI({ esi: esiField!, values: { valueForESIC } }) *
                  (esiField?.employee_contribution ?? ESI_EMPLOYEE_CONTRIBUTION)
                ).toFixed(3)
              );
            } else if (field.includes("pt")) {
              for (const range of ptField?.gross_salary_range as any) {
                if (grossValue >= range.start && grossValue <= range.end) {
                  amount = range.value;
                  break;
                }
              }
            } else if (field.includes("lwf")) {
              const contrib = lwfField?.employee_contribution ?? 0;
              if (lwfField?.deduction_cycle === "monthly") amount = contrib;
              else if (lwfField?.deduction_cycle === "yearly")
                amount = contrib / 12;
              else if (lwfField?.deduction_cycle === "half_yearly")
                amount = contrib / 6;
              else if (lwfField?.deduction_cycle === "quarterly")
                amount = contrib / 3;
            } else if (field === "bonus" || field === "statutory_bonus") {
              amount = Number.parseFloat(
                (
                  ((bonusField?.percentage ?? BONUS_PERCENTAGE) * basicValue) /
                  100
                ).toFixed(3)
              );
            }
            return { ...entry, amount: amount ?? entry.amount };
          }
          return entry;
        });

        allSalaryEntries.push(...calculatedEntries);
      }

      const totalNetAmount = calculateSalaryTotalNetAmount(allSalaryEntries);

      const {
        status,
        error: salaryError,
        message,
      } = await createSalaryPayroll({
        supabase,
        data: {
          title: payrollTitle,
          type: "salary",
          salaryData: allSalaryEntries,
          totalEmployees: uniqueEmployeeIds.size,
          totalNetAmount,
        },
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
        formData.get("reimbursementData") as string
      ) as Pick<ReimbursementDataType, "id" | "employee_id" | "amount">[];

      const totalEmployees = Number.parseInt(
        formData.get("totalEmployees") as string
      );
      const totalNetAmount = Number.parseFloat(
        formData.get("totalNetAmount") as string
      );
      if (Number(reimbursementData.length) === 0) {
        return json({
          status: "error",
          message: "Payroll not created as entry already in other payroll",
          failedRedirect,
          error: "Entries already in other payroll",
        });
      }
      const {
        status,
        error: reimbursementError,
        message,
      } = await createReimbursementPayroll({
        supabase,
        data: {
          title: payrollTitle,
          type,
          reimbursementData,
          totalEmployees,
          totalNetAmount,
        },
        from,
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
        | "id"
        | "employee_id"
        | "bonus"
        | "deduction"
        | "gratuity"
        | "leave_encashment"
      >[];
      const totalEmployees = Number.parseInt(
        formData.get("totalEmployees") as string
      );
      const totalNetAmount = Number.parseFloat(
        formData.get("totalNetAmount") as string
      );

      if (Number(exitData.length) === 0) {
        return json({
          status: "error",
          message: "Payroll not created as entry already in other payroll",
          failedRedirect,
          error: "Entries already in other payroll",
        });
      }
      const {
        status,
        error: exitError,
        message,
      } = await createExitPayroll({
        supabase,
        data: {
          title: payrollTitle,
          type,
          exitData,
          totalEmployees,
          totalNetAmount,
        },
        from,
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
    if (type === "salary-import") {
      const salaryImportData = JSON.parse(
        formData.get("salaryImportData") as string
      );

      const transformedData: any[] = salaryImportData.flatMap((entry: any) => {
        const {
          month,
          year,
          present_days,
          overtime_hours,
          employee_id,
          ...components
        } = entry;

        return Object.entries(components)
          .filter(
            ([, value]) =>
              typeof value === "object" && value !== null && "amount" in value
          )
          .map(([key, value]: [string, any]) => ({
            month,
            year,
            present_days: Number(present_days),
            overtime_hours,
            employee_id,
            field_name: key.toUpperCase(),
            type: value.type,
            is_pro_rata: false,
            consider_for_epf: false,
            consider_for_esic: false,
            amount: value.amount,
            is_overtime: false,
          }));
      });

      let totalNetAmount = 0;

      totalNetAmount = calculateSalaryTotalNetAmount(transformedData);
      const {
        status,
        error: salaryError,
        message,
      } = await createSalaryPayroll({
        supabase,
        data: {
          title: payrollTitle,
          type: "salary",
          salaryData: transformedData,
          totalEmployees: salaryImportData.length,
          totalNetAmount,
        },
        companyId: companyId ?? "",
      });

      if (isGoodStatus(status)) {
        if (Number(skipped) > 0) {
          return json({
            status: "success",
            message: `Salary Payroll Created  with ${skipped} skipped entries`,
            failedRedirect,
            error: null,
          });
        }
        return json({
          status: "success",
          message: message ?? "Import Salary Payroll Created Successfully",
          failedRedirect,
          error: null,
        });
      }

      error = salaryError;
    }

    return json(
      {
        status: "error",
        message: "Failed to Create payroll",
        failedRedirect,
        error,
      },
      { status: 500 }
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
            actionData?.error?.message ||
            actionData?.error ||
            "Payroll Creation failed",
          variant: "destructive",
        });
        navigate(actionData?.failedRedirect ?? DEFAULT_ROUTE);
      }
    }
  }, [actionData]);

  return null;
}
