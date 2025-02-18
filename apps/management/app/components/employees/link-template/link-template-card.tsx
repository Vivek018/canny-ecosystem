import { Card } from "@canny_ecosystem/ui/card";
import { Link } from "@remix-run/react";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import type { PaymentTemplateAssignmentsDatabaseRow } from "@canny_ecosystem/supabase/types";
import { createRole, formatDate, hasPermission, updateRole } from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { LinkTemplateDropdown } from "../link-template-dropdown";

type DetailItemProps = {
  label: string;
  value: string | null | undefined;
  formatter?: (value: string) => string;
};

const DetailItem: React.FC<DetailItemProps> = ({ label, value, formatter }) => {
  const formattedValue = value ? (formatter ? formatter(value) : value) : "--";

  return (
    <div className="flex flex-col">
      <h3 className="text-muted-foreground text-[13px] tracking-wide capitalize">{label}</h3>
      <p>{formattedValue}</p>
    </div>
  );
};

export const LinkTemplateItem = ({ paymentTemplateAssignmentData }:
  {
    paymentTemplateAssignmentData: PaymentTemplateAssignmentsDatabaseRow
  }) => {
  return (
    <section className="w-full select-text cursor-auto h-full flex flex-col justify-start p-4">
      <ul className="grid grid-cols-3 gap-4">
        <li><DetailItem label="Template Name" value={paymentTemplateAssignmentData.name} /></li>
        <li><DetailItem label="Template ID" value={paymentTemplateAssignmentData.template_id} /></li>
        <li><DetailItem label="Assignment Type" value={paymentTemplateAssignmentData.assignment_type} /></li>
        <li><DetailItem label="Employee ID" value={paymentTemplateAssignmentData.employee_id} /></li>
        <li><DetailItem label="Effective From" value={paymentTemplateAssignmentData.effective_from} formatter={formatDate} /></li>
        <li><DetailItem label="Effective To" value={paymentTemplateAssignmentData.effective_to} formatter={formatDate} /></li>
        <li><DetailItem label="Is Active" value={paymentTemplateAssignmentData.is_active ? "Yes" : "No"} /></li>
      </ul>
    </section>
  );
};

export const LinkTemplateCard = (
  { paymentTemplateAssignmentData }:
    { paymentTemplateAssignmentData: PaymentTemplateAssignmentsDatabaseRow }
) => {
  const { role } = useUser();

  return (
    <Card className="rounded w-full h-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Link Template</h2>
        <div>
          {
            paymentTemplateAssignmentData
              ?
              <LinkTemplateDropdown
                employeeId={paymentTemplateAssignmentData.employee_id as string}
                triggerChild={
                  <DropdownMenuTrigger
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "bg-card",
                      !hasPermission(
                        role, `${updateRole}:${attribute.employeePaymentTemplateLink}`,
                      ) && "hidden",
                    )}
                  >
                    <Icon name="dots-vertical" size="xs" className="mr-1.5" />
                    <p>More Options</p>
                  </DropdownMenuTrigger>
                }
              />
              :
              <Link
                to="link-template"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "bg-card",
                  !hasPermission(`${role}`, `${createRole}:${attribute.employeePaymentTemplateLink}`) && "hidden",
                )}
              >
                <Icon name={"plus-circled"} className="mr-2" />
                Create Template
              </Link>
          }
        </div>
      </div>

      <div className="w-full overflow-scroll no-scrollbar">
        {paymentTemplateAssignmentData ? (
          <div className="flex items-center gap-4 min-w-max">
            <LinkTemplateItem paymentTemplateAssignmentData={paymentTemplateAssignmentData} />
          </div>
        ) : (
          <div className="text-center py-8"><p>No link template available</p></div>
        )}
      </div>
    </Card>
  );
};
