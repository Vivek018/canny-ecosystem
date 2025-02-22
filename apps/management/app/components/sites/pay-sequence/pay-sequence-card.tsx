import { workingDaysOptions } from "@/constant";
import { useUser } from "@/utils/user";
import type { SitePaySequenceDatabaseRow } from "@canny_ecosystem/supabase/types";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Card } from "@canny_ecosystem/ui/card";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Label } from "@canny_ecosystem/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@canny_ecosystem/ui/toggle-group";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { createRole, getOrdinalSuffix, hasPermission } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import { Link, useParams } from "@remix-run/react";

export const PaySequenceItem = ({
  paySequence,
}: {
  paySequence: Omit<SitePaySequenceDatabaseRow, "created_at" | "updated_at">;
}) => {
  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center gap-2'>
        <Label className='font-bold'>Pay Day:</Label>
        <p className='text-base'>
          {getOrdinalSuffix(paySequence.pay_day)} of every month
        </p>
      </div>
      <div className='flex items-center gap-2'>
        <Label className='font-bold'>Pay Frequency:</Label>
        <p className='capitalize'>{paySequence.pay_frequency}</p>
      </div>
      <div className='flex items-center gap-2'>
        <Label className='w-max font-bold'>Working Days:</Label>
        <ToggleGroup
          type='multiple'
          variant='outline'
          className='flex gap-2'
          disabled={true}
        >
          {workingDaysOptions.map(({ label, value }) => (
            <ToggleGroupItem
              key={value}
              className={cn(
                "flex items-center space-x-2 disabled:opacity-100",
                paySequence.working_days.includes(Number.parseInt(value)) &&
                  "bg-secondary"
              )}
            >
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
};

export const PaySequenceCard = ({
  paySequence,
}: {
  paySequence: Omit<
    SitePaySequenceDatabaseRow,
    "created_at" | "updated_at"
  > | null;
}) => {
  const { role } = useUser();
  const { projectId, siteId } = useParams();

  return (
    <Card className='rounded w-full h-full p-4'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold'>Pay Sequence</h2>
        <div>
          <Link
            to={`/projects/${projectId}/${siteId}/overview/update-pay-sequence`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "bg-card",
              !hasPermission(
                role,
                `${createRole}:${attribute.employeePaymentTemplateLink}`
              ) && "hidden"
            )}
          >
            <Icon name={"edit"} className='mr-2' />
            Edit
          </Link>
        </div>
      </div>

      <div className='w-full overflow-scroll no-scrollbar'>
        {paySequence ? (
          <div className='flex items-center gap-4 min-w-max'>
            <PaySequenceItem paySequence={paySequence} />
          </div>
        ) : (
          <div className='text-center py-8'>
            <p>Pay squence not available</p>
          </div>
        )}
      </div>
    </Card>
  );
};
