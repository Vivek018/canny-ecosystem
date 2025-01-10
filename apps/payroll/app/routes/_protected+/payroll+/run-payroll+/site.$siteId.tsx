import { PayrollComponent } from "@/components/payroll/payroll-component";
import { CANNY_MANAGEMENT_SERVICES_COMPANY_ID } from "@/constant";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { createPayroll, createPayrollEntry } from "@canny_ecosystem/supabase/mutations";
import { getEarliestPayrollBySiteId, getEmployeeById, getEmployeeIdsByProjectSiteId, getEmployeeProjectAssignmentByEmployeeId, getEmployeeProvidentFundById, getEmployeeStateInsuranceById, getLabourWelfareFundById, getPaymentFieldById, getPaymentTemplateByEmployeeId, getPaymentTemplateBySiteId, getPaymentTemplateComponentsByTemplateId, getPayrollEnrtyAmountByEmployeeIdAndPayrollIdAndPaymentTemplateComponentId, getProfessionalTaxById, getReimbursementsByEmployeeId, getRelationshipIdByParentIdAndChildId, getRelationshipTermsById, getStatutoryBonusById } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { PaymentTemplateComponentsDatabaseRow, PayrollDatabaseInsert } from "@canny_ecosystem/supabase/types";
import { calculateEPF, calculateESI, calculateLWF, calculatePaymentField, calculatePT, calculateSB, toCamelCase, type PayrollEmployeeData } from "@canny_ecosystem/utils";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const siteId = params.siteId as string;
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const { data: payrollData } = await getEarliestPayrollBySiteId({ supabase, site_id: siteId });

  // helper functions
  const populateTemplateComponentData = async (payrollEntry: PayrollEmployeeData, templateComponents: PaymentTemplateComponentsDatabaseRow[]) => {
    (templateComponents ?? []).map(async (templateComponent) => {
      const templateEntry = { paymentTemplateComponentId: templateComponent.id } as any;
      if (templateComponent.payment_field_id) {
        const { data } = await getPaymentFieldById({ supabase, id: templateComponent.payment_field_id });
        if (data) {
          templateEntry.name = toCamelCase(data.name);
          templateEntry[templateEntry.name] = { ...data, componentType: templateComponent.component_type };
        }
      }
      if (templateComponent.bonus_id) {
        const { data } = await getStatutoryBonusById({ supabase, id: templateComponent.bonus_id });
        if (data) {
          templateEntry.name = "statutoryBonus";
          templateEntry[templateEntry.name] = { ...data, componentType: templateComponent.component_type };
        }
      }
      if (templateComponent.esi_id) {
        const { data } = await getEmployeeStateInsuranceById({ supabase, id: templateComponent.esi_id });
        if (data) {
          templateEntry.name = "esi";
          templateEntry[templateEntry.name] = { ...data, componentType: templateComponent.component_type };
        }
      }
      if (templateComponent.epf_id) {
        const { data } = await getEmployeeProvidentFundById({ supabase, id: templateComponent.epf_id });
        if (data) {
          templateEntry.name = "epf";
          templateEntry[templateEntry.name] = { ...data, componentType: templateComponent.component_type };
        }
      }
      if (templateComponent.pt_id) {
        const { data } = await getProfessionalTaxById({ supabase, id: templateComponent.pt_id });
        if (data) {
          templateEntry.name = "pt";
          templateEntry[templateEntry.name] = { ...data, componentType: templateComponent.component_type };
        }
      }
      if (templateComponent.lwf_id) {
        const { data } = await getLabourWelfareFundById({ supabase, id: templateComponent.lwf_id });
        if (data) {
          templateEntry.name = "lwf";
          templateEntry[templateEntry.name] = { ...data, componentType: templateComponent.component_type };
        }
      }
      payrollEntry.templateComponents.push(templateEntry);
    });
  }
  const calculateAmount = (templateComponent: any, gross_pay: number) => {
    if (templateComponent?.statutoryBonus) return calculateSB(templateComponent.statutoryBonus, gross_pay);
    if (templateComponent?.epf) return calculateEPF(templateComponent.epf, gross_pay);
    if (templateComponent?.esi) return calculateESI(templateComponent.esi, gross_pay);
    if (templateComponent?.pt) return calculatePT(templateComponent.pt, gross_pay);
    if (templateComponent?.lwf) return calculateLWF(templateComponent.lwf, gross_pay);
    return calculatePaymentField(templateComponent[templateComponent.name]);
  }

  // preparing payroll entries
  const { data } = await getEmployeeIdsByProjectSiteId({ supabase, projectSiteId: siteId });
  const payrollEntries = await Promise.all(
    (data ?? []).map(async (e) => {
      const payrollEntry = {} as PayrollEmployeeData;
      payrollEntry.employee_id = e.employee_id;
      payrollEntry.site_id = siteId;
      payrollEntry.templateComponents = [];
      payrollEntry.rate = 1000; // for temprory calculation -> it will come from template component

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
      // select default template if there's no template linked with the current employee/site
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
      if (reimbursementsData)
        payrollEntry.reimbursements = reimbursementsData?.reduce((total, r: any) => total + r.amount, 0);

      // dynamic fields are now polulated -> now populate static fields here..
      payrollEntry.gross_pay = payrollEntry.rate * payrollEntry.present_days;
      payrollEntry.deductions = 0; // will come from payment_template_components
      payrollEntry.net_pay = payrollEntry.gross_pay - payrollEntry.deductions - payrollEntry.reimbursements;
      payrollEntry.status = "pending";

      return payrollEntry;
    })
  );

  let PAYROLL_ID: string;
  if (!payrollData) // creating payroll 
  {
    // creating payroll object => dataToBeSaved
    const dataToBeSaved: PayrollDatabaseInsert = {
      site_id: siteId,
      status: "pending",
      run_date: new Date().toISOString().split('T')[0],
      total_net_amount: payrollEntries.reduce((sum, employee) => sum + employee.net_pay, 0),
      total_employees: payrollEntries.length,
      commission: 0
    }

    // to calculate commission
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
    PAYROLL_ID = createdPayrollData?.id ? createdPayrollData?.id : "";

    // saving payroll entries
    console.log("jbvsa41", payrollEntries);

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
        entry.amount = calculateAmount(templateComponent, payrollEntry.gross_pay);
        await createPayrollEntry({ supabase, data: entry as any });
      }
      if (payrollEntry.templateComponents.length === 0) {
        await createPayrollEntry({ supabase, data: entry as any });
      }
    });
  }
  else PAYROLL_ID = payrollData.id;

  // prepare the data and return
  await Promise.all(
    payrollEntries.map(async (payrollEntry) => {
      payrollEntry.payrollId = PAYROLL_ID;
      await Promise.all(
        payrollEntry.templateComponents.map(async (templateComponent: any) => {
          const { data: amountData } = await getPayrollEnrtyAmountByEmployeeIdAndPayrollIdAndPaymentTemplateComponentId({
            supabase,
            employeeId: payrollEntry.employee_id,
            payrollId: PAYROLL_ID,
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
  return <PayrollComponent data={payrollEntries as any} editable={true} />
}