import type { EmployeeProvidentFundDatabaseRow } from "@canny_ecosystem/supabase/types";
import { Card } from "@canny_ecosystem/ui/card";
import {
  EDLI_RESTRICTED_VALUE,
  EMPLOYEE_RESTRICTED_VALUE,
  EMPLOYER_RESTRICTED_VALUE,
} from "@canny_ecosystem/utils";
import {
  EMPLOYEE_EPF_PERCENTAGE,
  EMPLOYER_ADMIN_CHARGES_PERCENTAGE,
  EMPLOYER_EDLI_PERCENTAGE,
  EMPLOYER_EPF_PERCENTAGE,
  EMPLOYER_EPS_PERCENTAGE,
} from "@canny_ecosystem/utils/constant";

type DetailItemProps = {
  label: string;
  helperText: string;
  value: number | null | undefined;
};

const DetailItem: React.FC<DetailItemProps> = ({
  label,
  helperText,
  value,
}) => {
  return (
    <div className="flex justify-between text-sm">
      <p>
        {label}{" "}
        {helperText && (
          <span className="text-xs text-gray-700 dark:text-gray-300">
            {helperText}
          </span>
        )}
      </p>
      <p>{value ? `₹ ${value.toPrecision(4)}` : "-"}</p>
    </div>
  );
};

export function SampleEPFCalculationCard({
  data,
}: {
  data: Omit<EmployeeProvidentFundDatabaseRow, "created_at" | "updated_at">;
}) {
  const employeeEPFPercentage =
    data?.employee_contribution ?? EMPLOYEE_EPF_PERCENTAGE;
  const employerEPFPercentage =
    data?.employer_contribution ?? EMPLOYER_EPF_PERCENTAGE;

  const currentEmployeeRate = data?.restrict_employee_contribution
    ? data?.employee_restrict_value ?? EMPLOYEE_RESTRICTED_VALUE
    : 20000;
  const currentEmployerRate = data?.restrict_employer_contribution
    ? data?.employer_restrict_value ?? EMPLOYER_RESTRICTED_VALUE
    : 20000;

  const employeeEPF = currentEmployeeRate * employeeEPFPercentage;

  const epsSubTotal = Math.round(
    EMPLOYEE_RESTRICTED_VALUE * EMPLOYER_EPS_PERCENTAGE,
  );

  const epfSubTotal = currentEmployerRate * employeeEPFPercentage - epsSubTotal;

  const edliSubTotal = Math.min(
    currentEmployerRate * EMPLOYER_EDLI_PERCENTAGE,
    EDLI_RESTRICTED_VALUE,
  );

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
    <Card className="flex flex-col gap-5 min-w-[400px] max-w-[500px] border-t-primary border-2 max-lg:hidden">
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
                    : `(${employeeEPFPercentage * 100}% of 20000)`
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
                  employerEPFPercentage * 100
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

              <div className="flex justify-between text-sm font-medium">
                <p>Total </p> <p>₹ {total}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
