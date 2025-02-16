import { PayrollComponent } from "@/components/payroll/payroll-component";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  getDefaultTemplateIdByCompanyId,
  getEmployeeById,
  getEmployeeIdsByProjectSiteId,
  getEmployeeProjectAssignmentByEmployeeId,
  getPaymentFieldById,
  getPaymentTemplateByEmployeeId,
  getPaymentTemplateBySiteId,
  getPaymentTemplateComponentsByTemplateId,
  getPayrollEntryAmountByEmployeeIdAndPayrollIdAndPaymentTemplateComponentId,
  type PaymentTemplateComponentType,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { TypedSupabaseClient } from "@canny_ecosystem/supabase/types";
import type { PayrollEmployeeData } from "@canny_ecosystem/utils";
import { type LoaderFunctionArgs, defer } from "@remix-run/node";
import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

async function getTemplateComponents(
  supabase: TypedSupabaseClient,
  employeeId: string,
  siteId: string,
  companyId: string,
) {
  // Try employee template first
  const { data: employeeTemplateData } = await getPaymentTemplateByEmployeeId({
    supabase,
    employeeId,
  });

  if (employeeTemplateData) {
    return await getPaymentTemplateComponentsByTemplateId({
      supabase,
      templateId: employeeTemplateData.template_id,
    });
  }

  // Try site template next
  const { data: siteTemplateData } = await getPaymentTemplateBySiteId({
    supabase,
    site_id: siteId,
  });

  if (siteTemplateData) {
    return await getPaymentTemplateComponentsByTemplateId({
      supabase,
      templateId: siteTemplateData.template_id,
    });
  }

  // Fall back to default template
  const { data: defaultPaymentTemplateData } =
    await getDefaultTemplateIdByCompanyId({
      supabase,
      companyId,
    });

  if (defaultPaymentTemplateData) {
    return await getPaymentTemplateComponentsByTemplateId({
      supabase,
      templateId: defaultPaymentTemplateData.id,
    });
  }

  return { data: null };
}

async function populateTemplateComponentData(
  supabase: TypedSupabaseClient,
  payrollEntry: PayrollEmployeeData,
  templateComponents: PaymentTemplateComponentType[],
) {
  const componentPromises = templateComponents.map(
    async (templateComponent) => {
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
      } else {
        // Handle special cases
        if (templateComponent.bonus_id) templateEntry.name = "statutory bonus";
        if (templateComponent.esi_id)
          templateEntry.name = "employee state insurance";
        if (templateComponent.epf_id)
          templateEntry.name = "employee provident fund";
        if (templateComponent.pt_id) templateEntry.name = "professional tax";
        if (templateComponent.lwf_id)
          templateEntry.name = "labour welfare fund";
      }

      templateEntry.value = templateComponent.calculation_value ?? 0;
      templateEntry.componentType = templateComponent.component_type;
      return templateEntry;
    },
  );

  payrollEntry.templateComponents = await Promise.all(componentPromises);
  return payrollEntry;
}

async function preparePayrollData(
  supabase: TypedSupabaseClient,
  siteId: string,
  payrollId: string,
  companyId: string,
) {
  const { data: employeeIds } = await getEmployeeIdsByProjectSiteId({
    supabase,
    projectSiteId: siteId,
  });

  const payrollEntriesPromise = Promise.all(
    (employeeIds ?? []).map(async (e) => {
      const payrollEntry = {
        employee_id: e.employee_id,
        site_id: siteId,
        templateComponents: [],
        present_days: 25, // TODO: extract from employee_attendance
        gross_pay: 0,
        deductions: 0,
        net_pay: 0,
        status: "approved",
        payrollId,
      } as PayrollEmployeeData;

      // Get employee data
      const [employeeData, employeeProjectAssignment, templateComponents] =
        await Promise.all([
          getEmployeeById({ supabase, id: e.employee_id }),
          getEmployeeProjectAssignmentByEmployeeId({
            supabase,
            employeeId: e.employee_id,
          }),
          getTemplateComponents(supabase, e.employee_id, siteId, companyId),
        ]);

      if (employeeData.data) {
        payrollEntry.name = `${employeeData.data.first_name} ${employeeData.data.middle_name} ${employeeData.data.last_name}`;
        payrollEntry.employee_code = employeeData.data.employee_code;
      }

      if (employeeProjectAssignment.data) {
        payrollEntry.designation =
          employeeProjectAssignment.data.position ?? "";
      }

      if (templateComponents.data) {
        await populateTemplateComponentData(
          supabase,
          payrollEntry,
          templateComponents.data,
        );

        // Get amounts for template components
        await Promise.all(
          payrollEntry.templateComponents.map(
            async (templateComponent: any) => {
              const { data: amountData } =
                await getPayrollEntryAmountByEmployeeIdAndPayrollIdAndPaymentTemplateComponentId(
                  {
                    supabase,
                    employeeId: payrollEntry.employee_id,
                    payrollId,
                    templateComponentId:
                      templateComponent.paymentTemplateComponentId,
                  },
                );
              templateComponent.amount = amountData?.amount;
            },
          ),
        );
      }

      return payrollEntry;
    }),
  );

  return payrollEntriesPromise;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const siteId = params.siteId as string;
  const payrollId = params.payrollId as string;

  const payrollEntriesPromise = preparePayrollData(
    supabase,
    siteId,
    payrollId,
    companyId,
  );

  return defer({ payrollEntriesPromise });
}

export async function action() {
  return null;
}

export default function PayrollId() {
  const { payrollEntriesPromise } = useLoaderData<typeof loader>();

  return (
    <Suspense
      fallback={
        <div className="w-full py-20 text-center">Loading payroll data...</div>
      }
    >
      <Await resolve={payrollEntriesPromise}>
        {(payrollEntries) => (
          <PayrollComponent data={payrollEntries as any} editable={false} />
        )}
      </Await>
    </Suspense>
  );
}
