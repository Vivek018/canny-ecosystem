import type { EmployeeProvidentFundDatabaseRow } from "@canny_ecosystem/supabase/types";
import { Card } from "@canny_ecosystem/ui/card";

const EMPLOYEE_EPF_PERCENTAGE = 0.12;
const EMPLOYER_EPS_PERCENTAGE = 0.0833;
const EMPLOYER_EPF_PERCENTAGE = 0.12;
const EMPLOYER_EDLI_PERCENTAGE = 0.005;
const EMPLOYER_ADMIN_CHARGES_PERCENTAGE = 0.005;

type DetailItemProps = {
  label: string;
  helperText: string;
  value: string | number | null | undefined;
  formatter?: (value: string | number) => string;
};

const DetailItem: React.FC<DetailItemProps> = ({
  label,
  helperText,
  value,
  formatter,
}) => {
  const formattedValue = value ? (formatter ? formatter(value) : value) : "--";

  return (
    <div className="flex justify-between text-sm">
      <p>
        {label}{" "}
        <span className="text-xs text-gray-700 dark:text-gray-300">
          {helperText}
        </span>
      </p>
      <p>₹ {formattedValue}</p>
    </div>
  );
};

export function SampleEPFCalculationCard({
  data,
}: {
  data: Omit<EmployeeProvidentFundDatabaseRow, "created_at" | "updated_at">;
}) {
  const currentEmployeeRate = data?.restrict_employee_contribution
    ? 15000
    : 20000;
  const currentEmployerRate = data?.restrict_employer_contribution
    ? 15000
    : 20000;

  const employeeEPF = currentEmployeeRate * EMPLOYEE_EPF_PERCENTAGE;
  const epsSubTotal = currentEmployerRate * EMPLOYER_EPS_PERCENTAGE;
  const epfSubTotal =
    currentEmployerRate * EMPLOYER_EPF_PERCENTAGE - epsSubTotal;
  const edliSubTotal = currentEmployerRate * EMPLOYER_EDLI_PERCENTAGE;
  const adminChargesSubTotal =
    currentEmployerRate * EMPLOYER_ADMIN_CHARGES_PERCENTAGE;

  let total = epfSubTotal + epsSubTotal;

  if (data?.include_employer_contribution) {
    if (data?.include_employer_edli_contribution) {
      total += edliSubTotal;
    }
    if (data?.include_admin_charges) {
      total += adminChargesSubTotal;
    }
  }

  return (
    <Card className="flex flex-col gap-5 min-w-[400px] max-w-[500px] border-t-blue-400 border-2 max-lg:hidden">
      <div className="p-6 w-full">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Sample EPF Calculation</h2>
          <p className="text-sm text-pretty">
            Let's assume the PF wage is ₹ 20,000. The breakup of contribution
            will be:
          </p>
        </div>

        <div className="p-6 border-2 rounded-xl mt-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <h2 className="font-md">Employees' Contribution</h2>
              <DetailItem
                label="EPF"
                value={employeeEPF}
                helperText={
                  data?.restrict_employee_contribution
                    ? "(Max of ₹ 15,000)"
                    : "(12% of 20000)"
                }
              />
            </div>

            <hr className="border-dashed border-gray-300" />

            <div className="flex flex-col gap-4">
              <h2 className="font-md">Employer's Contribution</h2>
              <DetailItem
                label="EPS"
                value={epsSubTotal}
                helperText={`(${
                  EMPLOYER_EPS_PERCENTAGE * 100
                }% of ${currentEmployerRate} (Max of ₹ 15,000))`}
              />
              <DetailItem
                label="EPF"
                value={epfSubTotal}
                helperText={`(${
                  EMPLOYER_EPF_PERCENTAGE * 100
                }% of ${currentEmployerRate} - EPS)`}
              />
              {data?.include_employer_contribution && (
                <>
                  {data?.include_employer_edli_contribution && (
                    <DetailItem
                      label="EDLI"
                      value={edliSubTotal}
                      helperText={`(${
                        EMPLOYER_EDLI_PERCENTAGE * 100
                      }% of ${currentEmployerRate})`}
                    />
                  )}
                  {data?.include_admin_charges && (
                    <DetailItem
                      label="Admin Charges"
                      value={adminChargesSubTotal}
                      helperText={`(${
                        EMPLOYER_ADMIN_CHARGES_PERCENTAGE * 100
                      }% of ${currentEmployerRate})`}
                    />
                  )}
                </>
              )}

              <hr />

              <div className="flex justify-between text-sm font-[500]">
                <p>Total </p> <p>₹ {total}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
