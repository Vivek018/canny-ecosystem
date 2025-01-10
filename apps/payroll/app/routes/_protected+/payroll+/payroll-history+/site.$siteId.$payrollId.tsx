import { PayrollComponent } from "@/components/payroll/payroll-component";
import { getEmployeeById, getEmployeeIdsByProjectSiteId, getEmployeeProjectAssignmentByEmployeeId, getEmployeeProvidentFundById, getEmployeeStateInsuranceById, getLabourWelfareFundById, getPaymentFieldById, getPaymentTemplateByEmployeeId, getPaymentTemplateBySiteId, getPaymentTemplateComponentsByTemplateId, getPayrollEnrtyAmountByEmployeeIdAndPayrollIdAndPaymentTemplateComponentId, getProfessionalTaxById, getReimbursementsByEmployeeId, getStatutoryBonusById } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { PaymentTemplateComponentsDatabaseRow } from "@canny_ecosystem/supabase/types";
import { toCamelCase, type PayrollEmployeeData } from "@canny_ecosystem/utils";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const siteId = params.siteId as string;
  const payrollId = params.payrollId as string;

  // helper functions
  const populateTemplateComponentData = async (payrollEntry: PayrollEmployeeData, templateComponents: PaymentTemplateComponentsDatabaseRow[]) => {
    templateComponents.map(async (templateComponent) => {
      const templateEntry = { paymentTemplateComponentId: templateComponent.id } as any;
      let name = null;
      if (templateComponent.payment_field_id) {
        const { data } = await getPaymentFieldById({ supabase, id: templateComponent.payment_field_id });
        if (data) {
          name = toCamelCase(data.name);
          templateEntry[name] = { ...data, componentType: templateComponent.component_type };
        }
      }
      if (templateComponent.bonus_id) {
        const { data } = await getStatutoryBonusById({ supabase, id: templateComponent.bonus_id });
        if (data) {
          name = "statutoryBonus";
          templateEntry[name] = { ...data, componentType: templateComponent.component_type };
        }
      }
      if (templateComponent.esi_id) {
        const { data } = await getEmployeeStateInsuranceById({ supabase, id: templateComponent.esi_id });
        if (data) {
          name = "esi";
          templateEntry[name] = { ...data, componentType: templateComponent.component_type };
        }
      }
      if (templateComponent.epf_id) {
        const { data } = await getEmployeeProvidentFundById({ supabase, id: templateComponent.epf_id });
        if (data) {
          name = "epf";
          templateEntry[name] = { ...data, componentType: templateComponent.component_type };
        }
      }
      if (templateComponent.pt_id) {
        const { data } = await getProfessionalTaxById({ supabase, id: templateComponent.pt_id });
        if (data) {
          name = "pt";
          templateEntry[name] = { ...data, componentType: templateComponent.component_type };
        }
      }
      if (templateComponent.lwf_id) {
        const { data } = await getLabourWelfareFundById({ supabase, id: templateComponent.lwf_id });
        if (data) {
          name = "lwf";
          templateEntry[name] = { ...data, componentType: templateComponent.component_type };
        }
      }
      templateEntry.name = name; // payment field !!
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
      payrollEntry.rate = 1000; // for temprory calculations -> it will come from template component

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
          templateID: employeeTemplateData.template_id as string,
        });
        if (templateComponents) {
          await populateTemplateComponentData(payrollEntry, templateComponents);
          payrollEntry.rate = 1000; // it will come from payment_template_components
        }
      }
      else // When the template is linked with the site
      {
        const { data: siteTemplateData } = await getPaymentTemplateBySiteId({ supabase, site_id: siteId });
        if (siteTemplateData) {
          const { data: templateComponents } = await getPaymentTemplateComponentsByTemplateId({
            supabase,
            templateID: siteTemplateData.template_id as string,
          });

          if (templateComponents) {
            await populateTemplateComponentData(payrollEntry, templateComponents);
            payrollEntry.rate = 1000; // it will come from payment_template_components
          }
        }
      }

      // populating reimbursements related data
      const { data: reimbursementsData } =
        await getReimbursementsByEmployeeId({
          supabase,
          employeeId: e.employee_id,
          params: {
            from: 0,
            to: Number.MAX_SAFE_INTEGER
          }
        });
      if (reimbursementsData) {
        payrollEntry.reimbursements = reimbursementsData?.reduce((total, r:any) => total + r.amount, 0);
      }

      // dynamic fields are now polulated -> now populate static fields here..
      payrollEntry.gross_pay = payrollEntry.rate * payrollEntry.present_days;
      payrollEntry.deductions = 0; // will come from payment_template_components
      payrollEntry.net_pay = payrollEntry.gross_pay - payrollEntry.deductions - payrollEntry.reimbursements;
      payrollEntry.status = "pending";

      return payrollEntry;
    })
  );

  // prepare the data and return..
  await Promise.all(
    payrollEntries.map(async (payrollEntry) => {
      payrollEntry.payrollId = payrollId;

      await Promise.all(
        payrollEntry.templateComponents.map(async (templateComponent:any) => {
          const { data: amountData } = await getPayrollEnrtyAmountByEmployeeIdAndPayrollIdAndPaymentTemplateComponentId({
            supabase,
            employeeId: payrollEntry.employee_id,
            payrollId,
            templateComponentId: templateComponent.paymentTemplateComponentId,
          });
          templateComponent.amount = 0;
          if (amountData) templateComponent.amount = amountData.amount;
        })
      );
    })
  );

  return json({ payrollEntries });
}

export default function PayrollId() {
  const { payrollEntries } = useLoaderData<typeof loader>();
  return <PayrollComponent data={payrollEntries as any} editable={false} />
}