import { PayrollComponent } from "@/components/payroll/payroll-component";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getDefaultTemplateIdByCompanyId, getEmployeeById, getEmployeeIdsByProjectSiteId, getEmployeeProjectAssignmentByEmployeeId, getPaymentFieldById, getPaymentTemplateByEmployeeId, getPaymentTemplateBySiteId, getPaymentTemplateComponentsByTemplateId, getPayrollEntryAmountByEmployeeIdAndPayrollIdAndPaymentTemplateComponentId, type PaymentTemplateComponentType } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { PayrollEmployeeData } from "@canny_ecosystem/utils";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const siteId = params.siteId as string;
  const payrollId = params.payrollId as string;

  // helper function
  const populateTemplateComponentData = async (payrollEntry: PayrollEmployeeData, templateComponents: PaymentTemplateComponentType[]) => {
    (templateComponents ?? []).map(async (templateComponent) => {
      const templateEntry = { paymentTemplateComponentId: templateComponent.id } as any;
      if (templateComponent.payment_field_id) {
        const { data } = await getPaymentFieldById({ supabase, id: templateComponent.payment_field_id });
        if (data) {
          templateEntry.name = data.name;
          templateEntry.is_pro_rata = data.is_pro_rata;
          templateEntry.consider_for_epf = data.consider_for_epf;
          templateEntry.consider_for_esic = data.consider_for_esic;
        }
      }
      if (templateComponent.bonus_id) templateEntry.name = "statutory bonus";
      if (templateComponent.esi_id) templateEntry.name = "employee state insurance";
      if (templateComponent.epf_id) templateEntry.name = "employee provident fund";
      if (templateComponent.pt_id) templateEntry.name = "professional tax";
      if (templateComponent.lwf_id) templateEntry.name = "labour welfare fund";

      templateEntry.value = templateComponent.calculation_value ?? 0;
      templateEntry.componentType = templateComponent.component_type;
      payrollEntry.templateComponents.push(templateEntry);
    });
  }

  // preparing payroll entries
  const { data } = await getEmployeeIdsByProjectSiteId({ supabase, projectSiteId: siteId });
  const payrollEntries = await Promise.all(
    (data ?? []).map(async (e) => {
      const payrollEntry = {} as PayrollEmployeeData;
      payrollEntry.employee_id = e.employee_id;
      payrollEntry.site_id = siteId;
      payrollEntry.templateComponents = [];

      // populating employee related data
      const { data: employeeData } = await getEmployeeById({ supabase, id: e.employee_id });
      if (employeeData) {
        payrollEntry.name = `${employeeData?.first_name} ${employeeData?.middle_name} ${employeeData?.last_name}`;
        payrollEntry.employee_code = employeeData?.employee_code;
      }

      // populating attendance related data
      payrollEntry.present_days = 25; // extract from employee_attendance

      // populating designation related data
      const { data: employeeProjectAssignmentData } = await getEmployeeProjectAssignmentByEmployeeId({ supabase, employeeId: e.employee_id });
      if (employeeProjectAssignmentData) payrollEntry.designation = employeeProjectAssignmentData?.position ?? "";

      // populating template components related data
      const { data: employeeTemplateData } = await getPaymentTemplateByEmployeeId({ supabase, employeeId: e.employee_id });
      if (employeeTemplateData) // When the template is linked with the employee
      {
        const { data: templateComponents } = await getPaymentTemplateComponentsByTemplateId({
          supabase,
          templateId: employeeTemplateData.template_id,
        });
        if (templateComponents) await populateTemplateComponentData(payrollEntry, templateComponents);
      }
      else // When the template is linked with the site
      {
        const { data: siteTemplateData } = await getPaymentTemplateBySiteId({ supabase, site_id: siteId });
        if (siteTemplateData) {
          const { data: templateComponents } = await getPaymentTemplateComponentsByTemplateId({
            supabase,
            templateId: siteTemplateData.template_id,
          });

          if (templateComponents) await populateTemplateComponentData(payrollEntry, templateComponents);
        }
        else // if control goes here that means default template is assigned to it!
        {
          const { data: defaultPaymentTemplateData } = await getDefaultTemplateIdByCompanyId({ supabase, companyId });
          if (defaultPaymentTemplateData) {
            const { data: templateComponents } = await getPaymentTemplateComponentsByTemplateId({
              supabase,
              templateId: defaultPaymentTemplateData.id,
            });
            if (templateComponents) await populateTemplateComponentData(payrollEntry, templateComponents);
          }
        }
      }

      // dynamic fields are now polulated -> now populate static fields here..
      payrollEntry.gross_pay = 0;
      payrollEntry.deductions = 0; // will come from payment_template_components
      payrollEntry.net_pay = 0;
      payrollEntry.status = "approved";

      return payrollEntry;
    })
  );

  // prepare the data and return..
  await Promise.all(
    payrollEntries.map(async (payrollEntry) => {
      payrollEntry.payrollId = payrollId;
      await Promise.all(
        payrollEntry.templateComponents.map(async (templateComponent: any) => {
          const { data: amountData } = await getPayrollEntryAmountByEmployeeIdAndPayrollIdAndPaymentTemplateComponentId({
            supabase,
            employeeId: payrollEntry.employee_id,
            payrollId,
            templateComponentId: templateComponent.paymentTemplateComponentId,
          });
          templateComponent.amount = amountData?.amount;
        })
      );
    })
  );

  return json({ payrollEntries });
}
export async function action() { return null; }

export default function PayrollId() {
  const { payrollEntries } = useLoaderData<typeof loader>();
  return <PayrollComponent data={payrollEntries as any} editable={false} />
}