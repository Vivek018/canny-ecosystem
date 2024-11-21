import EmployerContributionSplitUp from "@/components/statutory-fields/employee-provident-fund/employer-contribution-split-up";
import { Card } from "@canny_ecosystem/ui/card";
import { Link } from "@remix-run/react";
import React from "react";

const EmployeeProvidentFund = () => {
  return (
    <div className="grid grid-cols-[60%_40%] py-5 pl-5 gap-3 place-content-center justify-between">
      <div className="min-h-screen pt-6">
        <div className="flex gap-5">
          <h4 className="text-lg font-semibold">Employees' Provident Fund</h4>
          <Link
            to="/payment_fields/statutory-bonus/create-employee-provident-fund"
            className="rounded-2xl p-2 bg-slate-300"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z"
                fill="currentColor"
                fill-rule="evenodd"
                clip-rule="evenodd"
              ></path>
            </svg>
          </Link>
        </div>
        <br />
        <br />
        <div className="flex flex-col justify-between gap-6">
          <div className="flex gap-10">
            <div className="min-w-[30%] text-gray-500">EPF Number</div>
            <div className="self-start font-[500]">-</div>
          </div>
          <div className="flex gap-10">
            <div className="min-w-[30%] text-gray-500">Deduction Cycles</div>
            <div className="self-start font-[500]">Monthly</div>
          </div>
          <div className="flex gap-10">
            <div className="min-w-[30%] text-gray-500">
              Employee Contribution Rate
            </div>
            <div className="self-start font-[500]">12% of Actual PF Wage</div>
          </div>
          <div className="flex gap-10">
            <div className="min-w-[30%] text-gray-500">
              Employer Contribution Rate
            </div>
            <div className="self-start font-[500]">
              12% of Actual PF Wage{" "}
              <EmployerContributionSplitUp employersRate={{ value: 20 }} />
            </div>
          </div>
          <div className="flex gap-10">
            <div className="min-w-[30%] text-gray-500">CTC Inclusions</div>
            <div className="self-start font-[500] flex flex-col justify-between items-center gap-2">
              <div className="self-start font-[500] flex items-center">
                <span>&#10003;</span>
                <span className="ml-2">
                  {" "}
                  Employer's contribution is included in the CTC.{" "}
                </span>
              </div>
              <div className="self-start font-[500] flex items-center">
                <span>&#10003;</span>
                <span className="ml-2">
                  {" "}
                  Employer's EDLI contribution is included in the CTC.{" "}
                </span>
              </div>
              <div className="self-start font-[500] flex items-center">
                <span>&#10003;</span>
                <span className="ml-2">
                  {" "}
                  Admin charges is included in the CTC.{" "}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-10">
            <div className="min-w-[30%] text-gray-500">
              Allow Employee level Override
            </div>
            <div className="self-start font-[500]">No</div>
          </div>

          <div className="flex gap-10">
            <div className="min-w-[30%] text-gray-500">
              Pro-rate Restricted PF Wage
            </div>
            <div className="self-start font-[500]">No</div>
          </div>

          <div className="flex gap-10">
            <div className="text-wrap w-[30%] text-gray-500">
              Consider applicable salary components based on LOP
            </div>
            <div className="self-start font-[500]">
              {" "}
              Yes (when PF wage is less than ₹15,000){" "}
            </div>
          </div>

          <div className="flex gap-10">
            <div className="min-w-[30%] text-gray-500">
              Eligible for ABRY Scheme
            </div>
            <div className="self-start font-[500]">
              {" "}
              Yes (Only Employee contribution is included){" "}
            </div>
          </div>

          <br />
          
          <button className="flex gap-1 text-sm items-center text-blue-500 cursor-pointer">
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
              <h2 className="text-[17px] font-[500]">Sample EPF Calculation</h2>
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
                        (12% of 20000)
                      </span>
                    </p>
                    <p>₹ 2400</p>
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
                        (8.33% of 20000 (Max of ₹ 15,000))
                      </span>
                    </p>{" "}
                    <p>₹ 1250</p>
                  </div>

                  <div className="flex justify-between text-[13.5px]">
                    <p>
                      EPF{" "}
                      <span className="text-[12px] text-gray-700">
                        (12% of 20000 - EPS)
                      </span>
                    </p>{" "}
                    <p>₹ 1150</p>
                  </div>

                  <div className="flex justify-between text-[13.5px]">
                    <p>
                      EDLI Contribution{" "}
                      <span className="text-[12px] text-gray-700">
                        (0.55% of 20000)
                      </span>
                    </p>{" "}
                    <p>₹ 75</p>
                  </div>

                  <div className="flex justify-between text-[13.5px]">
                    <p>
                      EPF Admin Charges{" "}
                      <span className="text-[12px] text-gray-700">
                        (0.55% of 20000)
                      </span>
                    </p>{" "}
                    <p>₹ 100</p>
                  </div>

                  <hr />

                  <div className="flex justify-between text-[14px] font-[500]">
                    <p>Total </p> <p>₹ 2575</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeProvidentFund;
