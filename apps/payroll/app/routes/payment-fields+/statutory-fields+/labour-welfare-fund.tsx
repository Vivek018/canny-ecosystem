import { Card } from "@canny_ecosystem/ui/card";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Link } from "@remix-run/react";
import React from "react";

const LabourWelfareFund = () => {
  return (
    <div className="py-5 pl-5">
      <div className="min-h-screen max-w-[40vw] py-6">
        <div className="flex flex-col gap-1 items-start">
          <h4 className="text-lg font-semibold">Labour Welfare Fund</h4>

          <p className="text-[12.5px]">
            Labour Welfare Fund act ensures social security and improves working
            conditions for employees.
          </p>
        </div>
        <br />
        <Card className="rounded w-[80%] h-full pl-4 pr-6 pb-8 pt-4 flex flex-col gap-5 justify-between">
          <div className="flex justify-between items-center font-[600]  ">
            <h4>Gujarat</h4>
          </div>

          <div className="flex flex-col justify-between gap-4">
            <div className="flex gap-10">
              <div className="min-w-[40%] text-gray-500">Employees' Contribution</div>
              <div className="self-start font-[500]">₹ 6.00</div>
            </div>
            <div className="flex gap-10">
              <div className="min-w-[40%] text-gray-500">Employer's Contribution</div>
              <div className="self-start font-[500]">₹ 12.00</div>
            </div>
            <div className="flex gap-10">
              <div className="min-w-[40%] text-gray-500">Deduction Cycle</div>
              <div className="self-start font-[500]">Half Yearly</div>
            </div>
            <div className="flex gap-10">
              <div className="min-w-[40%] text-gray-500">Status</div>
              <button className="self-start font-[500] text-blue-500">
                <span className="text-red-500">Disabled <span className="text-blue-500">(Enabled)</span></span>
              </button>
            </div>
          </div>
        </Card>
        <br />
      </div>
    </div>
  );
};

export default LabourWelfareFund;
