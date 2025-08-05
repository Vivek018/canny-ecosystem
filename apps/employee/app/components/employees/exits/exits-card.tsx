import { Card } from "@canny_ecosystem/ui/card";
import type { ExitsRow } from "@canny_ecosystem/supabase/types";
import { formatDate, replaceUnderscore } from "@canny_ecosystem/utils";

type DetailItemProps = {
  label: string;
  value: string | null | undefined;
};

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => {
  return (
    <div className="flex flex-col">
      <h3 className="text-muted-foreground text-[13px] tracking-wide capitalize">
        {label}
      </h3>
      <p className="truncate w-80">{value ?? "--"}</p>
    </div>
  );
};

export const ExitsItem = ({ exitsData }: { exitsData: any }) => {
  return (
    <section className="w-full select-text cursor-auto h-full flex flex-col justify-start p-4">
      <ul className="grid grid-cols-3 max-sm:grid-cols-2 gap-4">
        <li>
          <DetailItem
            label="Organization Payable Days"
            value={exitsData?.organization_payable_days}
          />
        </li>
        <li>
          <DetailItem
            label="Employee Payable Days"
            value={exitsData?.employee_payable_days}
          />
        </li>
        <li>
          <DetailItem
            label="Last Working Day"
            value={formatDate(exitsData?.last_working_day)}
          />
        </li>
        <li>
          <DetailItem
            label="Final Settlement Date"
            value={formatDate(exitsData.final_settlement_date)}
          />
        </li>
        <li>
          <DetailItem
            label="Exit Reason"
            value={replaceUnderscore(exitsData.reason)}
          />
        </li>
        <li>
          <DetailItem label="Bonus" value={`₹${exitsData?.bonus}`} />
        </li>
        <li>
          <DetailItem
            label="Leave Encashment"
            value={`₹${exitsData.leave_encashment}`}
          />
        </li>
        <li>
          <DetailItem label="Gratuity" value={`₹${exitsData.gratuity}`} />
        </li>
        <li>
          <DetailItem label="Deduction" value={`₹${exitsData?.deduction}`} />
        </li>
        <li>
          <DetailItem
            label="Net Pay"
            value={exitsData.net_pay ? `₹${exitsData?.net_pay}` : "-"}
          />
        </li>
        <li>
          <DetailItem label="Note" value={exitsData?.note} />
        </li>
      </ul>
    </section>
  );
};

export const ExitsCard = ({
  exitsData,
}: {
  exitsData: Omit<ExitsRow, "created_at"> | null;
  employeeId: string;
}) => {
  return (
    <Card className="rounded w-full h-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Exits</h2>
      </div>
      <div className="w-full overflow-scroll no-scrollbar">
        {exitsData ? (
          <div className="flex items-center gap-4 min-w-max">
            <ExitsItem exitsData={exitsData} />
          </div>
        ) : (
          <div className="text-center py-8">
            <p>Exit data not found</p>
          </div>
        )}
      </div>
    </Card>
  );
};
