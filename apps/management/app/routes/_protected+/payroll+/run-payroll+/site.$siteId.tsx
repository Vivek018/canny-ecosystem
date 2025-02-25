import LoadingSpinner from "@/components/loading-spinner";
import { PayrollComponent } from "@/components/payroll/payroll-component";
import { CANNY_MANAGEMENT_SERVICES_COMPANY_ID } from "@/constant";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  createPayroll,
  createPayrollEntry,
} from "@canny_ecosystem/supabase/mutations";
import {
  getDefaultTemplateIdByCompanyId,
  getEarliestPayrollBySiteId,
  getEmployeeById,
  getEmployeeIdsByProjectSiteId,
  getEmployeeProjectAssignmentByEmployeeId,
  getPaymentFieldById,
  getPaymentTemplateByEmployeeId,
  getPaymentTemplateBySiteId,
  getPaymentTemplateComponentsByTemplateId,
  getPayrollEntryAmountByEmployeeIdAndPayrollIdAndPaymentTemplateComponentId,
  getRelationshipIdByParentIdAndChildId,
  getRelationshipTermsById,
  getSitePaySequenceInSite,
  type PaymentTemplateComponentType,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type {
  PayrollDatabaseInsert,
  TypedSupabaseClient,
} from "@canny_ecosystem/supabase/types";
import {
  getWorkingDaysInCurrentMonth,
  newAmount,
  type PayrollEmployeeData,
} from "@canny_ecosystem/utils";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Await, defer, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

async function populateTemplateComponentData(
  supabase: TypedSupabaseClient,
  payrollEntry: PayrollEmployeeData,
  templateComponents: PaymentTemplateComponentType[],
) {
  await Promise.all(
    (templateComponents ?? []).map(async (templateComponent) => {
      const templateEntry = {
        paymentTemplateComponentId: templateComponent.id,
      } as any;

      if (templateComponent.payment_field_id) {
        const { data } = await getPaymentFieldById({
          supabase,
          id: templateComponent.payment_field_id,
        });
        if (data) {
          templateEntry.name = data.name;
          templateEntry.is_pro_rata = data.is_pro_rata;
          templateEntry.consider_for_epf = data.consider_for_epf;
          templateEntry.consider_for_esic = data.consider_for_esic;
        }
      }

      // Set name based on component type
      if (templateComponent.bonus_id) templateEntry.name = "statutory bonus";
      if (templateComponent.esi_id)
        templateEntry.name = "employee state insurance";
      if (templateComponent.epf_id)
        templateEntry.name = "employee provident fund";
      if (templateComponent.pt_id) templateEntry.name = "professional tax";
      if (templateComponent.lwf_id) templateEntry.name = "labour welfare fund";

      templateEntry.value = templateComponent.calculation_value ?? 0;
      templateEntry.componentType = templateComponent.component_type;
      payrollEntry.templateComponents.push(templateEntry);
    }),
  );
}

async function processPayrollEntries(
  supabase: TypedSupabaseClient,
  siteId: string,
  companyId: string,
  workingDays: number,
) {
  const { data: employeeData } = await getEmployeeIdsByProjectSiteId({
    supabase,
    projectSiteId: siteId,
  });

  return Promise.all(
    (employeeData ?? []).map(async (e) => {
      const payrollEntry = {} as PayrollEmployeeData;
      payrollEntry.employee_id = e.employee_id;
      payrollEntry.site_id = siteId;
      payrollEntry.templateComponents = [];

      // Employee data
      const [employeeInfo, assignmentData] = await Promise.all([
        getEmployeeById({ supabase, id: e.employee_id }),
        getEmployeeProjectAssignmentByEmployeeId({
          supabase,
          employeeId: e.employee_id,
        }),
      ]);

      if (employeeInfo.data) {
        payrollEntry.name = `${employeeInfo.data.first_name} ${employeeInfo.data.middle_name} ${employeeInfo.data.last_name}`;
        payrollEntry.employee_code = employeeInfo.data.employee_code;
      }

      payrollEntry.present_days = 25; // TODO: extract from employee_attendance
      payrollEntry.designation = assignmentData.data?.position ?? "";

      // Template processing
      const employeeTemplate = await getPaymentTemplateByEmployeeId({
        supabase,
        employeeId: e.employee_id,
      });

      if (employeeTemplate.data) {
        const { data: templateComponents } =
          await getPaymentTemplateComponentsByTemplateId({
            supabase,
            templateId: employeeTemplate.data.template_id,
          });
        if (templateComponents)
          await populateTemplateComponentData(
            supabase,
            payrollEntry,
            templateComponents,
          );
      } else {
        const siteTemplate = await getPaymentTemplateBySiteId({
          supabase,
          site_id: siteId,
        });

        if (siteTemplate.data) {
          const { data: templateComponents } =
            await getPaymentTemplateComponentsByTemplateId({
              supabase,
              templateId: siteTemplate.data.template_id,
            });
          if (templateComponents)
            await populateTemplateComponentData(
              supabase,
              payrollEntry,
              templateComponents,
            );
        } else {
          const defaultTemplate = await getDefaultTemplateIdByCompanyId({
            supabase,
            companyId,
          });
          if (defaultTemplate.data) {
            const { data: templateComponents } =
              await getPaymentTemplateComponentsByTemplateId({
                supabase,
                templateId: defaultTemplate.data.id,
              });
            if (templateComponents)
              await populateTemplateComponentData(
                supabase,
                payrollEntry,
                templateComponents,
              );
          }
        }
      }

      // Static fields
      payrollEntry.gross_pay = 0;
      payrollEntry.deductions = 0;
      payrollEntry.net_pay = 0;
      payrollEntry.status = "pending";

      return payrollEntry;
    }),
  );
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const siteId = params.siteId as string;

  const payrollDataPromise = Promise.all([
    getCompanyIdOrFirstCompany(request, supabase),
    getEarliestPayrollBySiteId({ supabase, site_id: siteId }),
    getSitePaySequenceInSite({ supabase, siteId }),
  ]).then(async ([companyData, payrollData, sitePaySequenceData]) => {
    const workingDays = getWorkingDaysInCurrentMonth(
      sitePaySequenceData.data?.working_days,
    );
    const payrollEntries = await processPayrollEntries(
      supabase,
      siteId,
      companyData.companyId,
      workingDays,
    );

    const PAYROLL_ID = payrollData.data?.id;
    if (PAYROLL_ID) {
      await Promise.all(
        payrollEntries.map(async (entry) => {
          await Promise.all(
            entry.templateComponents.map(async (component: any) => {
              if (component.is_pro_rata) {
                component.amount = newAmount(
                  component.value ?? 0,
                  entry.present_days,
                  workingDays,
                );
              } else {
                component.amount = component.value ?? 0;
              }

              const { data: amountData } =
                await getPayrollEntryAmountByEmployeeIdAndPayrollIdAndPaymentTemplateComponentId(
                  {
                    supabase,
                    employeeId: entry.employee_id,
                    payrollId: PAYROLL_ID,
                    templateComponentId: component.paymentTemplateComponentId,
                  },
                );
              if (amountData) component.amount = amountData.amount;
            }),
          );
        }),
      );
    }

    return payrollEntries;
  });

  return defer({ payrollDataPromise });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const siteId = params.siteId as string;

  const [companyData, payrollData, sitePaySequenceData] = await Promise.all([
    getCompanyIdOrFirstCompany(request, supabase),
    getEarliestPayrollBySiteId({ supabase, site_id: siteId }),
    getSitePaySequenceInSite({ supabase, siteId }),
  ]);

  if (payrollData.data) return null;

  const workingDays = getWorkingDaysInCurrentMonth(
    sitePaySequenceData.data?.working_days,
  );
  const payrollEntries = await processPayrollEntries(
    supabase,
    siteId,
    companyData.companyId,
    workingDays,
  );

  // Create payroll
  const dataToBeSaved: PayrollDatabaseInsert = {
    site_id: siteId,
    status: "pending",
    run_date: new Date().toISOString().split("T")[0],
    total_net_amount: payrollEntries.reduce(
      (sum, employee) => sum + employee.net_pay,
      0,
    ),
    total_employees: payrollEntries.length,
    commission: 0,
  };

  // Calculate commission
  const relationshipData = await getRelationshipIdByParentIdAndChildId({
    supabase,
    parentCompanyId: CANNY_MANAGEMENT_SERVICES_COMPANY_ID,
    childCompanyId: companyData.companyId,
  });

  if (relationshipData.data) {
    const relationshipTerms = (await getRelationshipTermsById({
      supabase,
      id: relationshipData.data.id,
      companyId: companyData.companyId,
    })) as any;
    dataToBeSaved.commission =
      (relationshipTerms.data?.terms?.service_charge *
        (dataToBeSaved?.total_net_amount ?? 0)) /
      100;
  }

  const createdPayroll = await createPayroll({ supabase, data: dataToBeSaved });
  const PAYROLL_ID = createdPayroll.data?.id;

  // Create payroll entries
  await Promise.all(
    payrollEntries.map(async (payrollEntry) => {
      const baseEntry = {
        employee_id: payrollEntry.employee_id,
        payroll_id: PAYROLL_ID,
        payment_status: "pending",
      };

      await Promise.all(
        payrollEntry.templateComponents.map(async (templateComponent: any) => {
          const entry = {
            ...baseEntry,
            payment_template_components_id:
              templateComponent.paymentTemplateComponentId,
            amount: templateComponent.is_pro_rata
              ? newAmount(
                  templateComponent.value ?? 0,
                  payrollEntry.present_days,
                  workingDays,
                )
              : templateComponent.value ?? 0,
          };

          await createPayrollEntry({ supabase, data: entry as any });
        }),
      );
    }),
  );

  return defer({ payrollDataPromise: Promise.resolve(payrollEntries) });
}

export default function PayrollId() {
  const { payrollDataPromise } = useLoaderData<typeof loader>();

  return (
    <Suspense fallback={<LoadingSpinner className="my-20" />}>
      <Await
        resolve={payrollDataPromise}
        errorElement={
          <div className="w-full p-4 text-center text-destructive">
            Error loading payroll data. Please try again later.
          </div>
        }
      >
        {(payrollEntries) => (
          <PayrollComponent data={payrollEntries as any} editable={true} />
        )}
      </Await>
    </Suspense>
  );
}
