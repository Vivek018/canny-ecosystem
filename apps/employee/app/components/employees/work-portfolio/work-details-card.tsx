import { Card, CardContent } from "@canny_ecosystem/ui/card";
import type { EmployeeWorkDetailsDataType } from "@canny_ecosystem/supabase/queries";
import { formatDate, replaceUnderscore } from "@canny_ecosystem/utils";

type DetailItemProps = {
  label: string;
  value: string | null | undefined;
};

export const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => {
  return (
    <div className="flex flex-col items-start">
      <h3 className="text-muted-foreground text-[13px] tracking-wide capitalize">
        {label}
      </h3>
      <p>{value ?? "--"}</p>
    </div>
  );
};

export const EmployeeWorkDetailsCard = ({
  workDetails,
}: {
  workDetails: EmployeeWorkDetailsDataType[];
}) => {
  return (
    <Card className="rounded w-full h-full p-4 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {workDetails.length ? "Work Details" : "No Work Details Available"}
        </h2>
      </div>

      {workDetails ? (
        workDetails.map((workDetail) => (
          <Card
            key={workDetail.id}
            className="w-full max-sm:w-11/12 shadow-none select-text cursor-auto dark:border-[1.5px] h-full flex flex-col justify-start"
          >
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              <DetailItem
                label="Project Name"
                value={workDetail.sites?.projects?.name}
              />
              <DetailItem label="Site Name" value={workDetail?.sites?.name} />
              <DetailItem
                label="Department"
                value={workDetail?.departments?.name}
              />
              <DetailItem
                label="Employee Code"
                value={workDetail?.employee_code}
              />
              <DetailItem
                label="Assignment Type"
                value={replaceUnderscore(workDetail?.assignment_type)}
              />
              <DetailItem
                label="Position"
                value={replaceUnderscore(workDetail?.position)}
              />
              <DetailItem
                label="Skill Level"
                value={replaceUnderscore(workDetail?.skill_level)}
              />
              <DetailItem
                label="Start Date"
                value={formatDate(workDetail?.start_date)}
              />
              <DetailItem
                label="End Date"
                value={formatDate(workDetail?.end_date)}
              />
              <DetailItem
                label="Probation Period"
                value={workDetail?.probation_period ? "Yes" : "No"}
              />
              <DetailItem
                label="Probation End Date"
                value={formatDate(workDetail?.probation_end_date)}
              />
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-8">
          <p>No Work details available.</p>
        </div>
      )}
    </Card>
  );
};
