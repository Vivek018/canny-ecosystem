import { PayrollComponent } from "@/components/payroll/payroll-component";
import { CANNY_MANAGEMENT_SERVICES_COMPANY_ID } from "@/constant";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { createPayroll, createPayrollEntry } from "@canny_ecosystem/supabase/mutations";
import { getDefaultTemplateIdByCompanyId, getEarliestPayrollBySiteId, getEmployeeById, getEmployeeIdsByProjectSiteId, getEmployeeProjectAssignmentByEmployeeId, getPaymentFieldById, getPaymentTemplateByEmployeeId, getPaymentTemplateBySiteId, getPaymentTemplateComponentsByTemplateId, getPayrollEntryAmountByEmployeeIdAndPayrollIdAndPaymentTemplateComponentId, getRelationshipIdByParentIdAndChildId, getRelationshipTermsById, getSitePaySequenceInSite, type PaymentTemplateComponentType } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { PayrollDatabaseInsert } from "@canny_ecosystem/supabase/types";
import { getWorkingDaysInCurrentMonth, newAmount, type PayrollEmployeeData } from "@canny_ecosystem/utils";
import { type ActionFunctionArgs, type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const siteId = params.siteId as string;
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const { data: payrollData } = await getEarliestPayrollBySiteId({ supabase, site_id: siteId });
  const { data: sitePaySequenceData } = await getSitePaySequenceInSite({ supabase, siteId });
  const totalWorkingDaysOfCurrentMonth = getWorkingDaysInCurrentMonth(sitePaySequenceData?.working_days);

  // helper functions
  const populateTemplateComponentData = async (payrollEntry: PayrollEmployeeData, templateComponents: PaymentTemplateComponentType[]) => {
    (templateComponents ?? []).map(async (templateComponent) => {
      const templateEntry = { paymentTemplateComponentId: templateComponent.id } as any;
      if (templateComponent.payment_field_id) {
        const { data } = await getPaymentFieldById({ supabase, id: templateComponent.payment_field_id });
        if (data) 
        {
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
  const { data: employeeData } = await getEmployeeIdsByProjectSiteId({ supabase, projectSiteId: siteId });
  const payrollEntries = await Promise.all(
    (employeeData ?? []).map(async (e) => {
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

      // dynamic fields are polulated -> now populate static fields here..
      payrollEntry.gross_pay = 0;
      payrollEntry.deductions = 0; // will come from payment_template_components
      payrollEntry.net_pay = 0;
      payrollEntry.status = "pending";

      return payrollEntry;
    })
  );

  const PAYROLL_ID = payrollData?.id as string;

  // prepare the data and return
  await Promise.all(
    payrollEntries.map(async (payrollEntry) => {
      payrollEntry.payrollId = PAYROLL_ID;
      await Promise.all(
        payrollEntry.templateComponents.map(async (templateComponent: any) => {
          if (templateComponent.is_pro_rata) templateComponent.amount = newAmount(templateComponent.value ?? 0, payrollEntry.present_days, totalWorkingDaysOfCurrentMonth);
          else templateComponent.amount = templateComponent.value ?? 0;

          const { data: amountData } = await getPayrollEntryAmountByEmployeeIdAndPayrollIdAndPaymentTemplateComponentId({
            supabase,
            employeeId: payrollEntry.employee_id,
            payrollId: PAYROLL_ID,
            templateComponentId: templateComponent.paymentTemplateComponentId,
          });
          if (amountData) templateComponent.amount = amountData.amount;
        })
      );
    })
  );

  return json({ payrollEntries });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const siteId = params.siteId as string;
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const { data: payrollData } = await getEarliestPayrollBySiteId({ supabase, site_id: siteId });
  if (payrollData) return null; // if payroll already exists then move to loader directly without creating

  const { data: sitePaySequenceData } = await getSitePaySequenceInSite({ supabase, siteId });
  const totalWorkingDaysOfCurrentMonth = getWorkingDaysInCurrentMonth(sitePaySequenceData?.working_days);

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
  const { data: employeeData } = await getEmployeeIdsByProjectSiteId({ supabase, projectSiteId: siteId });
  const payrollEntries = await Promise.all(
    (employeeData ?? []).map(async (e) => {
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

      // dynamic fields are polulated -> now populate static fields here..
      payrollEntry.gross_pay = 0;
      payrollEntry.deductions = 0; // will come from payment_template_components
      payrollEntry.net_pay = 0;
      payrollEntry.status = "pending";

      return payrollEntry;
    })
  );

  // creating payroll object => dataToBeSaved
  const dataToBeSaved: PayrollDatabaseInsert = {
    site_id: siteId,
    status: "pending",
    run_date: new Date().toISOString().split('T')[0],
    total_net_amount: payrollEntries.reduce((sum, employee) => sum + employee.net_pay, 0),
    total_employees: payrollEntries.length,
    commission: 0
  }

  // calculating commission
  const { data: relationshipData } = await getRelationshipIdByParentIdAndChildId({
    supabase,
    parentCompanyId: CANNY_MANAGEMENT_SERVICES_COMPANY_ID,
    childCompanyId: companyId
  });
  if (relationshipData) {
    const { data: relationshipTermsData } = await getRelationshipTermsById({
      supabase,
      id: relationshipData?.id,
      companyId,
    }) as any;
    dataToBeSaved.commission = (relationshipTermsData?.terms?.service_charge * (dataToBeSaved?.total_net_amount ?? 0)) / 100;
  }

  // saving payroll
  const { data: createdPayrollData } = await createPayroll({ supabase, data: dataToBeSaved });
  const PAYROLL_ID = createdPayrollData?.id;

  // saving payroll entries
  payrollEntries.map(async (payrollEntry) => {
    const entry = {
      employee_id: payrollEntry.employee_id,
      payroll_id: PAYROLL_ID,
      payment_template_components_id: null,
      amount: payrollEntry.net_pay,
      payment_status: "pending"
    };
    for (const templateComponent of payrollEntry.templateComponents) {
      entry.payment_template_components_id = templateComponent.paymentTemplateComponentId;
      if (templateComponent.is_pro_rata) entry.amount = newAmount(templateComponent.value ?? 0, payrollEntry.present_days, totalWorkingDaysOfCurrentMonth);
      else entry.amount = templateComponent.value ?? 0;

      await createPayrollEntry({ supabase, data: entry as any });
    }
  });

  return json({ payrollEntries });
}

export default function PayrollId() {
  const { payrollEntries } = useLoaderData<typeof loader>();
  return <PayrollComponent data={payrollEntries as any} editable={true} />
}