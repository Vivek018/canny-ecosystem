import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  createAttendanceByPayrollImportAndGiveID,
  createSalaryPayroll,
  createSalaryPayrollByDepartment,
} from "@canny_ecosystem/supabase/mutations";
import { getPayrollById } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type {
  EmployeeMonthlyAttendanceDatabaseInsert,
  PayrollFieldsDatabaseRow,
} from "@canny_ecosystem/supabase/types";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { calculateSalaryTotalNetAmount } from "@canny_ecosystem/utils";

import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const formData = await request.formData();
    const payrollTitle = formData.get("title") as string;
    const skipped = formData.get("skipped") as string;
    const type = formData.get("type") as string;
    const different = formData.get("different") as string;
    const site = formData.get("site") as string;
    const project = formData.get("project") as string;

    const failedRedirect = formData.get("failedRedirect") as string;
    let error = null;

    if (type === "salary-import") {
      const salaryImportData = JSON.parse(
        formData.get("salaryImportData") as string,
      );

      const transformedSalaryEntries: any[] = [];
      const uniqueComponentsSet = new Map();

      for (const entry of salaryImportData) {
        const { month, year, employee_id, ...rest } = entry;

        const attendanceFieldKeys = [
          "working_days",
          "present_days",
          "working_hours",
          "overtime_hours",
          "absent_days",
          "paid_holidays",
          "paid_leaves",
          "casual_leaves",
        ];

        const attendance: Record<string, any> = {};
        const components: Record<string, any> = {};

        for (const key in rest) {
          if (attendanceFieldKeys.includes(key)) {
            attendance[key] = rest[key];
          } else {
            components[key] = rest[key];

            if (
              components[key] &&
              typeof components[key] === "object" &&
              "type" in components[key]
            ) {
              const fieldName = key.toUpperCase();
              const type = components[key].type;

              if (!uniqueComponentsSet.has(fieldName)) {
                uniqueComponentsSet.set(fieldName, type);
              }
            }
          }
        }

        const { error: attendanceError, data: attendanceData } =
          await createAttendanceByPayrollImportAndGiveID({
            employee_id,
            month,
            supabase,
            insertData:
              attendance as unknown as EmployeeMonthlyAttendanceDatabaseInsert,
            year,
          });

        if (attendanceError || !attendanceData) {
          console.error("Failed to insert attendance", attendanceError);
          return json({
            status: "error",
            message:
              "Salary Payroll Creation failed as conflict in attendance data",
            failedRedirect,
            error: attendanceError,
          });
        }

        const monthly_attendance_id = attendanceData.id;

        transformedSalaryEntries.push({
          monthly_attendance_id,
          site_id: site,
        });
      }

      const payrollFields = Array.from(uniqueComponentsSet.entries()).map(
        ([name, type]) => ({
          name,
          type,
        }),
      );

      let totalNetAmount = 0;

      totalNetAmount = calculateSalaryTotalNetAmount(salaryImportData);

      if (different === "different") {
        const payrollId = formData.get("payrollId") as string;

        const { data } = await getPayrollById({ payrollId, supabase });

        const { error: salaryError, message } =
          await createSalaryPayrollByDepartment({
            supabase,
            data: {
              payrollId,
              salaryEntryData: transformedSalaryEntries,
              oldTotalEmployees: data?.total_employees ?? 0,
              totalEmployees:
                Number(salaryImportData.length) + Number(data?.total_employees),
              oldTotalNetAmount: data?.total_net_amount ?? 0,
              totalNetAmount:
                Number(totalNetAmount) + Number(data?.total_net_amount),
              payrollFieldsData:
                payrollFields as unknown as PayrollFieldsDatabaseRow[],
              rawData: salaryImportData,
            },
          });
        if (!salaryError) {
          if (Number(skipped) > 0) {
            return json({
              status: "success",
              message: `Salary Payroll Created with ${skipped} skipped entries`,
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

      const { error: salaryError, message } = await createSalaryPayroll({
        supabase,
        data: {
          title: payrollTitle,
          type: "salary",
          site,
          project,
          rawData: salaryImportData,
          salaryEntryData: transformedSalaryEntries,
          totalEmployees: salaryImportData.length,
          totalNetAmount,
          month: Number(salaryImportData[0]?.month),
          year: Number(salaryImportData[0]?.year),
          run_date: salaryImportData[0].run_date,
          payrollFieldsData:
            payrollFields as unknown as PayrollFieldsDatabaseRow[],
        },
        companyId: companyId ?? "",
      });

      if (!salaryError) {
        if (Number(skipped) > 0) {
          return json({
            status: "success",
            message: `Salary Payroll Created  with ${Number(skipped) > 0 ? skipped : ""} skipped entries`,
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

    // if (type === "salary") {
    //   const attendanceData = JSON.parse(
    //     formData.get("attendanceData") as string
    //   ) as Pick<
    //     SalaryEntriesDatabaseRow,
    //     "employee_id"
    //   >[];

    //   const allSalaryEntries: Omit<
    //     SalaryEntriesDatabaseRow,
    //     "id" | "created_at" | "payroll_id"
    //   >[] = [];

    //   const uniqueEmployeeIds = new Set<string>();

    //   for (const attendance of attendanceData) {
    //     const { employee_id, present_days, overtime_hours, month, year } =
    //       attendance;

    //     if (!employee_id || !month || !year || !present_days) continue;

    //     uniqueEmployeeIds.add(employee_id);

    //     const { data: linkedPaymentTemplate } =
    //       await getLinkedPaymentTemplateIdByEmployeeId({
    //         supabase,
    //         employeeId: employee_id,
    //         companyId,
    //       });

    //     if (!linkedPaymentTemplate?.template_id) continue;

    //     const { data: paymentTemplateComponents } =
    //       await getPaymentTemplateComponentsByTemplateId({
    //         supabase,
    //         templateId: linkedPaymentTemplate.template_id,
    //       });

    //     if (!paymentTemplateComponents) continue;

    //     const employeeSalaryEntries = [];

    //     let epfField = null;
    //     let esiField = null;
    //     let ptField = null;
    //     let lwfField = null;
    //     let bonusField = null;

    //     for (const component of paymentTemplateComponents) {
    //       let amount = component.calculation_value ?? 0;

    //       if (component.target_type === "epf")
    //         epfField = component.employee_provident_fund;
    //       if (component.target_type === "esi")
    //         esiField = component.employee_state_insurance;
    //       if (component.target_type === "pt")
    //         ptField = component.professional_tax;
    //       if (component.target_type === "lwf")
    //         lwfField = component.labour_welfare_fund;
    //       if (component.target_type === "bonus")
    //         bonusField = component.statutory_bonus;

    //       if (
    //         component.target_type === "payment_field" &&
    //         component.payment_fields?.is_pro_rata
    //       ) {
    //         const baseAmount = component.calculation_value ?? 0;
    //         const totalWorkingDays = 26;
    //         const overtimeRate = 1;
    //         amount = calculateProRataAmount({
    //           baseAmount,
    //           presentDays: present_days,
    //           totalWorkingDays,
    //           overtimeHours: overtime_hours ?? 0,
    //           overtimeRate,
    //         });
    //       }

    //       employeeSalaryEntries.push({
    //         month,
    //         year,
    //         present_days,
    //         overtime_hours: overtime_hours ?? 0,
    //         employee_id,
    //         template_component_id: component.id,
    //         field_name:
    //           component.target_type === "payment_field"
    //             ? component.payment_fields?.name
    //             : component.target_type.toUpperCase() ??
    //               component.component_type,
    //         type: component.component_type,
    //         is_pro_rata: component.payment_fields?.is_pro_rata ?? false,
    //         consider_for_epf:
    //           component.payment_fields?.consider_for_epf ?? false,
    //         consider_for_esic:
    //           component.payment_fields?.consider_for_esic ?? false,
    //         amount,
    //         is_overtime:
    //           component.target_type === "payment_field"
    //             ? component.payment_fields?.is_overtime ?? false
    //             : false,
    //       });
    //     }

    //     let grossValue = 0;
    //     let basicValue = 0;
    //     let valueForEPF = 0;
    //     let valueForESIC = 0;

    //     for (const entry of employeeSalaryEntries) {
    //       if (entry.type === "earning") grossValue += entry.amount;
    //       if (entry.field_name.toLowerCase() === "basic")
    //         basicValue = entry.amount;
    //       if (entry.consider_for_epf) {
    //         valueForEPF +=
    //           entry.type === "earning" ? entry.amount : -entry.amount;
    //       }
    //       if (entry.consider_for_esic) {
    //         valueForESIC +=
    //           entry.type === "earning" ? entry.amount : -entry.amount;
    //       }
    //     }

    //     const calculatedEntries = employeeSalaryEntries.map((entry) => {
    //       if (
    //         entry.type === "statutory_contribution" ||
    //         entry.type === "earning" ||
    //         entry.type === "bonus"
    //       ) {
    //         let amount = null;
    //         const field = entry.field_name.toLowerCase();
    //         if (field.includes("pf")) {
    //           amount = Number.parseFloat(
    //             (
    //               getValueforEPF({ epf: epfField!, values: { valueForEPF } }) *
    //               (epfField?.employee_contribution ?? EMPLOYEE_EPF_PERCENTAGE)
    //             ).toFixed(3)
    //           );
    //         } else if (field.includes("esi")) {
    //           amount = Number.parseFloat(
    //             (
    //               getValueforESI({ esi: esiField!, values: { valueForESIC } }) *
    //               (esiField?.employee_contribution ?? ESI_EMPLOYEE_CONTRIBUTION)
    //             ).toFixed(3)
    //           );
    //         } else if (field.includes("pt")) {
    //           for (const range of ptField?.gross_salary_range as any) {
    //             if (grossValue >= range.start && grossValue <= range.end) {
    //               amount = range.value;
    //               break;
    //             }
    //           }
    //         } else if (field.includes("lwf")) {
    //           const contrib = lwfField?.employee_contribution ?? 0;
    //           if (lwfField?.deduction_cycle === "monthly") amount = contrib;
    //           else if (lwfField?.deduction_cycle === "yearly")
    //             amount = contrib / 12;
    //           else if (lwfField?.deduction_cycle === "half_yearly")
    //             amount = contrib / 6;
    //           else if (lwfField?.deduction_cycle === "quarterly")
    //             amount = contrib / 3;
    //         } else if (field === "bonus" || field === "statutory_bonus") {
    //           amount = Number.parseFloat(
    //             (
    //               ((bonusField?.percentage ?? BONUS_PERCENTAGE) * basicValue) /
    //               100
    //             ).toFixed(3)
    //           );
    //         }
    //         return { ...entry, amount: amount ?? entry.amount };
    //       }
    //       return entry;
    //     });

    //     allSalaryEntries.push(...calculatedEntries);
    //   }

    //   const totalNetAmount = calculateSalaryTotalNetAmount(allSalaryEntries);

    //   const {
    //     status,
    //     error: salaryError,
    //     message,
    //   } = await createSalaryPayroll({
    //     supabase,
    //     data: {
    //       title: payrollTitle,
    //       type: "salary",
    //       salaryData: allSalaryEntries,
    //       totalEmployees: uniqueEmployeeIds.size,
    //       totalNetAmount,
    //     },
    //     companyId: companyId ?? "",
    //   });

    //   if (isGoodStatus(status)) {
    //     return json({
    //       status: "success",
    //       message: message ?? "Salary Payroll Created Successfully",
    //       failedRedirect,
    //       error: null,
    //     });
    //   }

    //   error = salaryError;
    // }

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
        clearCacheEntry(cacheKeyPrefix.run_payroll);
        clearCacheEntry(cacheKeyPrefix.run_payroll_id);
        toast({
          title: "Success",
          description: actionData?.message || "Payroll Created",
          variant: "success",
        });
        navigate(actionData?.failedRedirect ?? "payroll/run-payroll");
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
  }, [actionData, navigate, toast]);

  return (
    <div className="fixed inset-0 z-50 bg-background/80">
      <LoadingSpinner className="absolute top-1/2 -translate-y-1/2 m-0" />
    </div>
  );
}
