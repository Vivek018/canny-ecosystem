import { PayrollComponent } from "@/components/payroll/payroll-component";
import { getEmployeeById, getEmployeeIdsByProjectSiteId, getPaymentTemplateByEmployeeId, getPaymentTemplateComponentByTemplateId, getReimbursementsByEmployeeId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { PayrollEmployeeData } from "@canny_ecosystem/utils";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });

  const siteId = params.siteId as string;

  const { data, error } = await getEmployeeIdsByProjectSiteId({ supabase, projectSiteId: siteId });

  if (error) throw error;

  const payrollEntries = await Promise.all(
    (data ?? []).map(async (e) => {
      const payrollEntry = {} as PayrollEmployeeData;
      payrollEntry.employee_id = e.employee_id;
      payrollEntry.site_id = siteId;

      // populating employee related data
      const { data: employeeData } = await getEmployeeById({
        supabase,
        id: e.employee_id,
      });
      if (employeeData) {
        payrollEntry.name = `${employeeData?.first_name} ${employeeData?.middle_name} ${employeeData?.last_name}`;
        payrollEntry.employee_code = employeeData?.employee_code;
      }

      // populating attendance related data
      payrollEntry.present_days = 25; // extract from employee_attendance

      // populating template_assignment related data
      const { data: templateData } =
        await getPaymentTemplateByEmployeeId({
          supabase,
          employeeId: e.employee_id,
        });
      if (templateData) payrollEntry.designation = templateData?.position ?? "";

      const { data: templateComponentData } =
        await getPaymentTemplateComponentByTemplateId({
          supabase,
          templateID: templateData?.template_id as string,
        });

      if (templateComponentData) {
        // fetch epf, esic etc.
      }

      payrollEntry.rate = 1000; // it will come from payment_template_components

      const { data: reimbursementsData } =
        await getReimbursementsByEmployeeId({
          supabase,
          employeeId: e.employee_id,
        });
      if (reimbursementsData) {
        payrollEntry.reimbursements = reimbursementsData?.reduce((total: any, r: { amount: any; }) => total + r.amount, 0);
      }

      payrollEntry.gross_pay = payrollEntry.rate * payrollEntry.present_days;
      payrollEntry.deductions = 0; // will come from payment_template_components
      payrollEntry.net_pay = payrollEntry.gross_pay - payrollEntry.deductions - payrollEntry.reimbursements
      payrollEntry.status = "pending";

      return payrollEntry;
    })
  );

  return json({ payrollEntries });
}

export default function PayrollId() {
  const { payrollEntries } = useLoaderData<typeof loader>();
  return <PayrollComponent data={payrollEntries as PayrollEmployeeData[]} editable={false} />
}