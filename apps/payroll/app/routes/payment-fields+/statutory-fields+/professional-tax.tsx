import { Card } from "@canny_ecosystem/ui/card";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Link } from "@remix-run/react";
import React from "react";

const ProfessionalTax = () => {
  return (
    <div className="py-5 pl-5">
      <div className="min-h-screen max-w-[40vw] py-6">
        <div className="flex flex-col gap-1 items-start">
          <h4 className="text-lg font-semibold">Professional Tax</h4>

          <p className="text-[12.5px]">
            This tax is levied on an employee’s income by the State Government.
            Tax slabs differ in each state.
          </p>
        </div>
        <br />
        <Card className="rounded w-[80%] h-full pl-4 pr-6 pb-8 pt-4 flex flex-col gap-5 justify-between">
          <div className="flex justify-between items-center">
            <h4>Head Office</h4>
            <Link to={"/payment-fields/statutory-fields/create-professional-tax"} className="cursor-pointer p-2 rounded-2xl bg-gray-200">
              <Icon name="edit" className="w-[18px] h-[18px]" />
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
        <br />
        <hr />
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
          <span>Disable PT</span>
        </button>
      </div>
    </div>
  );
};

export default ProfessionalTax;
