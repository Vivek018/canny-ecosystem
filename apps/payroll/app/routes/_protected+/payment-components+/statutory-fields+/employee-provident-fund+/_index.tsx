import { DeleteEmployeeProvidentFund } from "@/components/statutory-fields/employee-provident-fund/delete-employee-provident-fund";
import EmployerContributionSplitUp from "@/components/statutory-fields/employee-provident-fund/employer-contribution-split-up";
import EPFNoData from "@/components/statutory-fields/employee-provident-fund/epf-nodata";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getEmployeeProvidentFundByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Card } from "@canny_ecosystem/ui/card";
import { Icon } from "@canny_ecosystem/ui/icon";
import { replaceUnderscore } from "@canny_ecosystem/utils";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData, useSubmit } from "@remix-run/react";
import { useEffect, useState } from "react";

type EPFState = {
  total: number;
  employeeEPF: number;
  employerEPS: number;
  employerEPF: number;
  employerEDLI: number;
  employerAdminCharges: number;
  employeeContribution: number;
  employerContribution: number;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = getSupabaseWithHeaders({ request });

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const { data, error } = await getEmployeeProvidentFundByCompanyId({
    supabase,
    companyId,
  });

  if (error) throw error;
  return json({ data: data as any });
};

export default function EmployeeProvidentFundIndex() {
  const { data } = useLoaderData<typeof loader>();
  const [epfState, setEPFState] = useState<EPFState>({
    total: 0,
    employeeEPF: 0,
    employerEPS: 0,
    employerEPF: 0,
    employerEDLI: 0,
    employerAdminCharges: 0,
    employeeContribution: data?.[0]?.restricted_employee_value ? 15000 : 20000,
    employerContribution: data?.[0]?.restricted_employer_value ? 15000 : 20000,
  });
  const submit = useSubmit();

  useEffect(() => {
    const employeeEPF = epfState?.employeeContribution * 0.12;
    const epsSubTotal = epfState?.employerContribution * 0.0833;
    const epfSubTotal = epfState?.employerContribution * 0.12 - epsSubTotal;
    const pointFiveSubTotal = epfState?.employerContribution * 0.005;

    const edliSubTotal = pointFiveSubTotal;
    const adminChargesSubTotal = pointFiveSubTotal;

    let total = epfSubTotal + epsSubTotal;

    if (data?.[0]?.include_employer_contribution) {
      if (data?.[0]?.include_employer_edli_contribution) {
        total += edliSubTotal;
      }
      if (data?.[0]?.include_admin_charges) {
        total += adminChargesSubTotal;
      }
    }

    setEPFState((prev: EPFState) => ({
      ...prev,
      total: total,
      employeeEPF: employeeEPF,
      employerEPS: epsSubTotal,
      employerEPF: epfSubTotal,
      employerEDLI: edliSubTotal,
      employerAdminCharges: adminChargesSubTotal,
    }));
  }, [data, epfState.employeeContribution, epfState.employerContribution]);

  const handleDelete = () => {
    submit(
      {},
      {
        method: "post",
        action: `/payment-components/statutory-fields/employee-provident-fund/${data?.[0]?.id}/delete-epf`,
        replace: true,
      }
    );
  };

  if (!data.length) return <EPFNoData />;
  return (
    <div className="p-4 grid grid-cols-[3fr_2fr] gap-3 place-content-center justify-between">
      <div className="min-h-screen">
        <div className="flex items-center gap-5 mb-8">
          <h4 className="text-lg font-semibold">Employees' Provident Fund</h4>
          <Link
            prefetch="intent"
            to={`/payment-components/statutory-fields/employee-provident-fund/${data?.[0]?.id}/update-epf`}
            className="p-2 rounded-full bg-secondary grid place-items-center"
          >
            <Icon name="edit" size="sm" />
          </Link>
        </div>
        <div className="flex flex-col justify-between gap-6 text-[0.9rem]">
          <div className="flex gap-2 max-lg:flex-col">
            <div className="w-1/3 text-gray-500">EPF Number</div>
            <div className="w-2/3 self-start font-[500]">
              {data?.[0]?.epf_number}
            </div>
          </div>
          <div className="flex gap-2 max-lg:flex-col">
            <div className="w-1/3 text-gray-500">Deduction Cycles</div>
            <div className="w-2/3 self-start font-[500] capitalize">
              {replaceUnderscore(data?.[0]?.deduction_cycle)}
            </div>
          </div>
          <div className="flex gap-2 max-lg:flex-col">
            <div className="w-1/3 text-gray-500">
              Employee Contribution Rate
            </div>
            <div className="w-2/3 self-start font-[500]">
              12% of Actual Wage
            </div>
          </div>
          <div className="flex gap-2 max-lg:flex-col">
            <div className="w-1/3 text-gray-500">
              Employer Contribution Rate
            </div>
            <div className="w-2/3 self-start font-[500]">
              12% of Actual Wage <EmployerContributionSplitUp />
            </div>
          </div>
          <div className="flex gap-2 max-lg:flex-col">
            <div className="w-1/3 text-gray-500">CTC Inclusions</div>
            <div className="w-2/3 self-start font-[500] flex flex-col justify-between items-center gap-2">
              <div className="self-start font-[500] flex items-center">
                {data?.[0]?.include_employer_contribution ? (
                  <span className="text-green-500">&#10003;</span>
                ) : (
                  <Icon name="cross" className="text-red-500" />
                )}
                <span className="ml-2">
                  {" "}
                  Employer's contribution is included in the CTC.{" "}
                </span>
              </div>
              <div className="self-start font-[500] flex items-center">
                {data?.[0]?.include_employer_edli_contribution ? (
                  <span className="text-green-500">&#10003;</span>
                ) : (
                  <Icon name="cross" className="text-red-500" />
                )}
                <span className="ml-2">
                  {" "}
                  Employer's EDLI contribution is included in the CTC.{" "}
                </span>
              </div>
              <div className="self-start font-[500] flex items-center">
                {data?.[0]?.include_admin_charges ? (
                  <span>&#10003;</span>
                ) : (
                  <Icon name="cross" className="text-red-500" />
                )}
                <span className="ml-2">
                  {" "}
                  Admin charges is included in the CTC.{" "}
                </span>
              </div>
            </div>
          </div>
            <div>
            <DeleteEmployeeProvidentFund employeeProvidentFundId={data?.[0]?.id}/>
            </div>
        </div>
      </div>

      <div className="w-full max-lg:invisible">
        <Card className="flex flex-col gap-5 mx-9 border-t-blue-400 border-2">
          <div className="p-6">
            <div className="flex flex-col gap-4">
              <h2 className="text-[1.05rem] font-[500]">
                Sample EPF Calculation
              </h2>
              <p className="text-[0.9rem] font-[500] text-pretty">
                Let's assume the PF wage is ₹ 20,000. The breakup of
                contribution will be:
              </p>
            </div>

            <div className="p-6 border-2 rounded-xl mt-5">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4">
                  <h2 className="text-[1rem] font-[500]">
                    Employees' Contribution
                  </h2>
                  <div className="flex justify-between text-[0.85rem]">
                    <p>
                      EPF{" "}
                      <span className="text-[0.75rem] text-gray-700 dark:text-gray-300">
                        {data?.[0]?.restrict_employee_contribution
                          ? "(Max of ₹ 15,000)"
                          : "(12% of 20000)"}
                      </span>
                    </p>
                    <p>₹ {epfState?.employeeEPF}</p>
                  </div>
                </div>

                <hr className="border-dashed border-gray-300" />

                <div className="flex flex-col gap-4">
                  <h2 className="text-[1rem] font-[500]">
                    Employer's Contribution
                  </h2>
                  <div className="flex justify-between text-[0.85rem]">
                    <p>
                      EPS{" "}
                      <span className="text-[0.75rem] text-gray-700 dark:text-gray-300">
                        (8.33% of {epfState?.employerContribution} (Max of ₹
                        15,000))
                      </span>
                    </p>{" "}
                    <p>₹ {epfState?.employerEPS}</p>
                  </div>

                  <div className="flex justify-between text-[0.85rem]">
                    <p>
                      EPF{" "}
                      <span className="text-[0.75rem] text-gray-700 dark:text-gray-300">
                        (12% of 20000 - EPS)
                      </span>
                    </p>{" "}
                    <p>₹ {epfState?.employerEPF}</p>
                  </div>

                  {data?.[0]?.include_employer_contribution && (
                    <>
                      {data?.[0]?.include_employer_edli_contribution && (
                        <div className="flex justify-between text-[0.85rem]">
                          <p>
                            EDLI Contribution{" "}
                            <span className="text-[0.75rem] text-gray-700 dark:text-gray-300">
                              (0.55% of {epfState?.employerContribution})
                            </span>
                          </p>{" "}
                          <p>₹ {epfState?.employerEDLI}</p>
                        </div>
                      )}

                      {data?.[0]?.include_admin_charges && (
                        <div className="flex justify-between text-[0.85rem]">
                          <p>
                            EPF Admin Charges{" "}
                            <span className="text-[0.75rem] text-gray-700 dark:text-gray-300">
                              (0.55% of {epfState?.employerContribution})
                            </span>
                          </p>{" "}
                          <p>₹ {epfState?.employerAdminCharges}</p>
                        </div>
                      )}
                    </>
                  )}

                  <hr />

                  <div className="flex justify-between text-[0.85rem] font-[500]">
                    <p>Total </p> <p>₹ {epfState?.total}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
