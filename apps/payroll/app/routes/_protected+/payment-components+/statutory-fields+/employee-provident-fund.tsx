import EmployerContributionSplitUp from "@/components/statutory-fields/employee-provident-fund/employer-contribution-split-up";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getEmployeeProvidentFundByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { Icon } from "@canny_ecosystem/ui/icon";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData, useSubmit } from "@remix-run/react";
import React, { useEffect } from "react";

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

const EmployeeProvidentFund = () => {
  const { data } = useLoaderData<typeof loader>();
  const [epfState, setEPFState] = React.useState<EPFState>({
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
        action: `/payment-components/statutory-fields/${data?.[0]?.id}/delete-epf`,
        replace: true,
      }
    );
  };

  if (data.length) {
    return (
      <div className="grid grid-cols-[60%_40%] py-5 pl-5 gap-3 place-content-center justify-between">
        <div className="min-h-screen pt-6">
          <div className="flex items-center gap-5">
            <h4 className="text-lg font-semibold">Employees' Provident Fund</h4>
            <Link
                  prefetch="intent"
              to={`/payment-components/statutory-fields/${data?.[0]?.id}/update-epf`}
              className="p-2 rounded-full bg-secondary grid place-items-center"
              >
              <Icon name="edit" size="sm" />
            </Link>
          </div>
          <br />
          <br />
          <div className="flex flex-col justify-between gap-6">
            <div className="flex gap-10">
              <div className="min-w-[30%] text-gray-500">EPF Number</div>
              <div className="self-start font-[500]">
                {data?.[0]?.epf_number}
              </div>
            </div>
            <div className="flex gap-10">
              <div className="min-w-[30%] text-gray-500">Deduction Cycles</div>
              <div className="self-start font-[500] capitalize">
                {data?.[0]?.deduction_cycle}
              </div>
            </div>
            <div className="flex gap-10">
              <div className="min-w-[30%] text-gray-500">
                Employee Contribution Rate
              </div>
              <div className="self-start font-[500]">12% of Actual Wage</div>
            </div>
            <div className="flex gap-10">
              <div className="min-w-[30%] text-gray-500">
                Employer Contribution Rate
              </div>
              <div className="self-start font-[500]">
                12% of Actual Wage{" "}
                <EmployerContributionSplitUp employersRate={{ value: 20 }} />
              </div>
            </div>
            <div className="flex gap-10">
              <div className="min-w-[30%] text-gray-500">CTC Inclusions</div>
              <div className="self-start font-[500] flex flex-col justify-between items-center gap-2">
                <div className="self-start font-[500] flex items-center">
                  {data?.[0]?.restrict_employer_contribution ? (
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

            <br />

            <button
              onClick={handleDelete}
              className="flex gap-1 text-sm items-center text-blue-500 cursor-pointer"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H5H10H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4L3.5 4C3.22386 4 3 3.77614 3 3.5ZM5 4H10V12H5V4Z"
                  fill="currentColor"
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <span>Disable EPF</span>
            </button>
          </div>
        </div>

        <div className="pt-3">
          <Card className="flex flex-col gap-5 mx-9 border-t-blue-400 border-2">
            <div className="p-6">
              <div className="flex flex-col gap-4">
                <h2 className="text-[17px] font-[500]">
                  Sample EPF Calculation
                </h2>
                <p className="text-[15px] font-[500] text-pretty">
                  Let's assume the PF wage is ₹ 20,000. The breakup of
                  contribution will be:
                </p>
              </div>

              <div className="p-6 border-2 rounded-xl mt-5">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-4">
                    <h2 className="text-[15px] font-[500]">
                      Employees' Contribution
                    </h2>
                    <div className="flex justify-between text-[13.5px]">
                      <p>
                        EPF{" "}
                        <span className="text-[12px] text-gray-700">
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
                    <h2 className="text-[15px] font-[500]">
                      Employer's Contribution
                    </h2>
                    <div className="flex justify-between text-[13.5px]">
                      <p>
                        EPS{" "}
                        <span className="text-[12px] text-gray-700">
                          (8.33% of {epfState?.employerContribution} (Max of ₹
                          15,000))
                        </span>
                      </p>{" "}
                      <p>₹ {epfState?.employerEPS}</p>
                    </div>

                    <div className="flex justify-between text-[13.5px]">
                      <p>
                        EPF{" "}
                        <span className="text-[12px] text-gray-700">
                          (12% of 20000 - EPS)
                        </span>
                      </p>{" "}
                      <p>₹ {epfState?.employerEPF}</p>
                    </div>

                    {data?.[0]?.include_employer_contribution && (
                      <>
                        {data?.[0]?.include_employer_edli_contribution && (
                          <div className="flex justify-between text-[13.5px]">
                            <p>
                              EDLI Contribution{" "}
                              <span className="text-[12px] text-gray-700">
                                (0.55% of {epfState?.employerContribution})
                              </span>
                            </p>{" "}
                            <p>₹ {epfState?.employerEDLI}</p>
                          </div>
                        )}

                        {data?.[0]?.include_admin_charges && (
                          <div className="flex justify-between text-[13.5px]">
                            <p>
                              EPF Admin Charges{" "}
                              <span className="text-[12px] text-gray-700">
                                (0.55% of {epfState?.employerContribution})
                              </span>
                            </p>{" "}
                            <p>₹ {epfState?.employerAdminCharges}</p>
                          </div>
                        )}
                      </>
                    )}

                    <hr />

                    <div className="flex justify-between text-[14px] font-[500]">
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
  } else {
    return (
      <div className="flex flex-col items-center justify-end m-auto">
        <div className="p-14"></div>
        <Card className="flex flex-col items-center justify-between gap-5 w-1/2 pt-6 px-2">
          <CardContent className="flex flex-col items-center justify-between gap-5">
            <CardTitle>Are you registered for EPF?</CardTitle>
            <CardDescription className="text-center text-[14px]">
              Any organisation with 20 or more employees must register for the
              Employee Provident Fund (EPF) scheme, a retirement benefit plan
              for all salaried employees.
            </CardDescription>
          </CardContent>

          <CardFooter>
            <Link
              to="/payment-components/statutory-fields/create-employee-provident-fund"
              className={buttonVariants({ variant: "primary-outline" })}
            >
              Enable EPF
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }
};

export default EmployeeProvidentFund;
