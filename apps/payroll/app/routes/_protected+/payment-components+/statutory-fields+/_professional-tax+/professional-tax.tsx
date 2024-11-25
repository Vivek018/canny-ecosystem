import { Card } from "@canny_ecosystem/ui/card";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Link } from "@remix-run/react";
import React from "react";

const ProfessionalTax = () => {
  return (
    <div className="">
      <div className="min-h-screen max-w-[40vw]">
        <div className="flex flex-col gap-1 items-start mb-3">
          <h4 className="text-lg font-semibold">Professional Tax</h4>

          <p className="text-[12.5px]">
            This tax is levied on an employee’s income by the State Government.
            Tax slabs differ in each state.
          </p>
        </div>
        <Card className="rounded w-[80%] h-full pl-4 pr-6 pb-8 pt-4 flex flex-col gap-5 justify-between">
        <div className="flex items-center gap-5">
            <h4 className="text-lg font-semibold">Employees' Provident Fund</h4>
            <Link
                  prefetch="intent"
              to={`/payment-components/statutory-fields/create-professional-tax`}
              className="p-2 rounded-full bg-secondary grid place-items-center"
              >
              <Icon name="edit" size="sm" />
            </Link>
          </div>

          <div className="flex flex-col justify-between gap-4">
            <div className="flex gap-10">
              <div className="min-w-[40%] text-gray-500">PT Number</div>
              <div className="self-start font-[500]">-</div>
            </div>
            <div className="flex gap-10">
              <div className="min-w-[40%] text-gray-500">State</div>
              <div className="self-start font-[500]">Gujarat</div>
            </div>
            <div className="flex gap-10">
              <div className="min-w-[40%] text-gray-500">Deduction Cycle</div>
              <div className="self-start font-[500]">Monthly</div>
            </div>
            <div className="flex gap-10">
              <div className="min-w-[40%] text-gray-500">PT Slabs</div>
              <button className="self-start font-[500] text-blue-500">
                View Tax Slabs
              </button>
            </div>
          </div>
        </Card>
        <hr className="my-5" />
        <button className="flex gap-1 text-sm items-center text-blue-500 cursor-pointer">
          <Icon name="trash" />
          <span>Disable PT</span>
        </button>
      </div>
    </div>
  );
};

export default ProfessionalTax;
