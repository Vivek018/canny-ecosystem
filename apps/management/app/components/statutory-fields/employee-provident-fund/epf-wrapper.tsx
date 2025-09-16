import { Icon } from "@canny_ecosystem/ui/icon";
import { Link } from "@remix-run/react";
import { EmployerContributionSplitUp } from "./employer-contribution-split-up";
import type { EmployeeProvidentFundDatabaseRow } from "@canny_ecosystem/supabase/types";
import { SampleEPFCalculationCard } from "./sample-epf-calculation-card";
import { EPFNoData } from "./epf-no-data";
import { DeleteEmployeeProvidentFund } from "./delete-employee-provident-fund";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  attribute,
  EMPLOYEE_EPF_PERCENTAGE,
} from "@canny_ecosystem/utils/constant";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { hasPermission, updateRole } from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { clearExactCacheEntry } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";

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
export function EPFWrapper({
  data,
  error,
}: {
  data: Omit<EmployeeProvidentFundDatabaseRow, "created_at"> | null;
  error: Error | null | { message: string };
}) {
  const { role } = useUser();
  const employeeContributionRateText = data?.restrict_employee_contribution
    ? "Restrict Contribution to ₹15,000 of PF Wage"
    : `${
        (data?.employee_contribution ?? EMPLOYEE_EPF_PERCENTAGE) * 100
      }% of Actual Wage`;

  const employerContributionRateText = data?.restrict_employer_contribution
    ? "Restrict Contribution to ₹15,000 of PF Wage"
    : `${
        (data?.employer_contribution ?? EMPLOYEE_EPF_PERCENTAGE) * 100
      }% of Actual Wage`;

  if (error) {
    clearExactCacheEntry(cacheKeyPrefix.statutory_field_epf);
    return <ErrorBoundary error={error} message="Failed to load data" />;
  }
  if (!data) return <EPFNoData />;

  return (
    <>
      <div>
        <div className="flex items-center gap-5 mb-8">
          <h4 className="text-lg font-semibold">Employees' Provident Fund</h4>

          <Link
            prefetch="intent"
            to={`/payment-components/statutory-fields/employee-provident-fund/${data?.id}/update-epf`}
            className={cn(
              "p-2 rounded-full bg-secondary grid place-items-center",
              !hasPermission(
                role,
                `${updateRole}:${attribute.statutoryFieldsEpf}`
              ) && "hidden"
            )}
          >
            <Icon name="edit" size="sm" />
          </Link>
        </div>
        <div className="flex flex-col justify-between gap-6 text-base">
          <DetailItem label="EPF Number" value={data?.epf_number} />
          <DetailItem
            label="Deduction Cycles"
            value={data?.deduction_cycle}
            className="capitalize"
          />
          <DetailItem label="Fields" value={data?.terms?.fields} />
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
    </>
  );
}
