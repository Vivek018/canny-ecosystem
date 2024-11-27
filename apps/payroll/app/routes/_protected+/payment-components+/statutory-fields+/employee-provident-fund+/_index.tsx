import { DeleteEmployeeProvidentFund } from "@/components/statutory-fields/employee-provident-fund/delete-employee-provident-fund";
import { EmployerContributionSplitUp } from "@/components/statutory-fields/employee-provident-fund/employer-contribution-split-up";
import { EPFNoData } from "@/components/statutory-fields/employee-provident-fund/epf-no-data";
import { SampleEPFCalculationCard } from "@/components/statutory-fields/employee-provident-fund/sample-epf-calculation-card";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getEmployeeProvidentFundByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Icon } from "@canny_ecosystem/ui/icon";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

export const EMPLOYEE_EPF_PERCENTAGE = 0.12;


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = getSupabaseWithHeaders({ request });

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const { data } = await getEmployeeProvidentFundByCompanyId({
    supabase,
    companyId,
  });

  return json({ data });
};

type DetailItemProps = {
  label: string;
  value: string | number | null | undefined;
  className?: string;
};

const DetailItem: React.FC<DetailItemProps> = ({ label, value, className }) => {
  return (
    <div className={`flex gap-2 max-lg:flex-col ${className ?? ""}`}>
      <div className="w-52 text-muted-foreground">{label}</div>
      <div className="self-start font-medium">{value || "-"}</div>
    </div>
  );
};

export default function EmployeeProvidentFundIndex() {
  const { data } = useLoaderData<typeof loader>();

  const employeeContributionRateText = data?.restrict_employee_contribution
    ? "Restrict Contribution to ₹15,000 of PF Wage"
    : `${(data?.employee_contribution ?? EMPLOYEE_EPF_PERCENTAGE) * 100}% of Actual Wage`;

  const employerContributionRateText = data?.restrict_employer_contribution
    ? "Restrict Contribution to ₹15,000 of PF Wage"
    : `${(data?.employer_contribution ?? EMPLOYEE_EPF_PERCENTAGE) * 100}% of Actual Wage`;

  if (!data) return <EPFNoData />;
  return (
    <div className="p-4 flex gap-3 place-content-center justify-between">
      <div>
        <div className="flex items-center gap-5 mb-8">
          <h4 className="text-lg font-semibold">Employees' Provident Fund</h4>
          <Link
            prefetch="intent"
            to={`/payment-components/statutory-fields/employee-provident-fund/${data?.id}/update-epf`}
            className="p-2 rounded-full bg-secondary grid place-items-center"
          >
            <Icon name="edit" size="sm" />
          </Link>
        </div>
        <div className="flex flex-col justify-between gap-6 text-base">
          <DetailItem label="EPF Number" value={data?.epf_number} />
          <DetailItem label="Deduction Cycles" value={data?.deduction_cycle} className="capitalize" />
          <DetailItem
            label="Employee Contribution Rate"
            value={employeeContributionRateText}
          />
          <div className="flex gap-2 max-lg:flex-col">
            <div className="w-52 text-muted-foreground">
              Employer Contribution Rate
            </div>
            <div className="self-start font-medium">
              {employerContributionRateText} <EmployerContributionSplitUp />
            </div>
          </div>
          <div className="flex gap-2 max-lg:flex-col">
            <div className="w-52 text-muted-foreground">CTC Inclusions</div>
            <div className="self-start font-medium flex flex-col justify-between items-center gap-2">
              <div className="self-start font-medium flex items-center">
                {data?.include_employer_contribution ? (
                  <span className="text-green-500">&#10003;</span>
                ) : (
                  <Icon name="cross" className="text-destructive" />
                )}
                <span className="ml-2">
                  {" "}
                  Employer's contribution is included in the CTC.{" "}
                </span>
              </div>
              <div className="self-start font-medium flex items-center">
                {data?.include_employer_edli_contribution ? (
                  <span className="text-green-500">&#10003;</span>
                ) : (
                  <Icon name="cross" className="text-destructive" />
                )}
                <span className="ml-2">
                  {" "}
                  Employer's EDLI contribution is included in the CTC.{" "}
                </span>
              </div>
              <div className="self-start font-medium flex items-center">
                {data?.include_admin_charges ? (
                  <span>&#10003;</span>
                ) : (
                  <Icon name="cross" className="text-destructive" />
                )}
                <span className="ml-2">
                  {" "}
                  Admin charges is included in the CTC.{" "}
                </span>
              </div>
            </div>
          </div>
          <hr />
          <div>
            <DeleteEmployeeProvidentFund employeeProvidentFundId={data?.id} />
          </div>
        </div>
      </div>

      <SampleEPFCalculationCard data={data} />
    </div>
  );
}
