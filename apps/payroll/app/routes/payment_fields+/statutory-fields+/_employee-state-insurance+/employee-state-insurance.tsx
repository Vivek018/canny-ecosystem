import { Icon } from "@canny_ecosystem/ui/icon";
import { Link } from "@remix-run/react";
import React from "react";

const EmployeeStateInsurance = () => {
  return (
    <div className="py-5 pl-5">
      <div className="min-h-screen max-w-[50vw] py-6">
        <div className="flex gap-5 items-center">
          <h4 className="text-lg font-semibold">Employees' State Insurance</h4>
          <Link
            to="/payment_fields/statutory-bonus/create-employee-state-insurance"
            className="rounded-2xl px-3 p-2 bg-slate-300 cursor-pointer"
          >
            <Icon name="edit" className="w-[18px] h-[18px]" />
          </Link>
        </div>
        <br />
        <br />
        <div className="flex flex-col justify-between gap-6">
          <div className="flex gap-10">
            <div className="min-w-[50%] text-gray-500">ESI Number</div>
            <div className="self-start font-[500] text-[0.95rem]">-</div>
          </div>
          <div className="flex gap-10">
            <div className="min-w-[50%] text-gray-500">Deduction Cycle</div>
            <div className="self-start font-[500] text-[0.95rem]">Monthly</div>
          </div>
          <div className="flex gap-10">
            <div className="min-w-[40%] text-gray-500">
              Employees' Contribution
            </div>
            <div className="self-start font-[500] text-[0.95rem]">0.75% of Gross Pay</div>
          </div>
          <div className="flex gap-10">
            <div className="min-w-[40%] text-gray-500">
              Employer's Contribution
            </div>
            <div className="self-start font-[500] text-[0.95rem]">3.25% of Gross Pay</div>
          </div>
        </div>
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
          <span>Disable ESI</span>
        </button>
      </div>
    </div>
  );
};

export default EmployeeStateInsurance;
