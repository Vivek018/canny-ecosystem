import type { LeaveTypeDataType } from "@canny_ecosystem/supabase/queries";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";

export function LeaveCountCards({
  leaveType,
  leaveTypeData,
}: {
  leaveType: {
    reduce: any;
    leave_type: string;
  };
  leaveTypeData?: LeaveTypeDataType | any;
}) {
  const leaveTypesMap =
    leaveTypeData?.reduce(
      (
        acc: { [x: string]: any },
        item: { leave_type: string | number; leaves_per_year: any }
      ) => {
        acc[item.leave_type] = item.leaves_per_year;
        return acc;
      },
      {} as Record<string, number>
    ) || {};

  const cardInfo = [
    { title: "Casual Leaves", key: "casual_leave" },
    { title: "Paid Leaves", key: "paid_leave" },
    { title: "Unpaid Leaves", key: "unpaid_leave" },
    { title: "Paternity Leaves", key: "paternity_leave" },
    { title: "Sick Leaves", key: "sick_leave" },
  ];

  // Calculate booked counts
  const bookedCounts = leaveType.reduce(
    (acc: { [x: string]: any }, { leave_type }: any) => {
      acc[leave_type] = (acc[leave_type] || 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <div className="mb-5 grid grid-cols-5 max-sm:grid-cols-2 gap-5">
      {cardInfo.map(({ title, key }) => (
        <Card
          key={title}
          className="w-full select-text cursor-auto dark:border-[1.5px] h-full flex flex-col justify-between"
        >
          <CardHeader className="flex flex-row space-y-0 items-center justify-center py-4">
            <CardTitle className="font-bold">{title}</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-2">
            <div className="flex justify-around">
              <p>Available</p>
              <p>{leaveTypesMap[key] || 0}</p>
            </div>
            <div className="flex justify-around">
              <p>Booked</p>
              <p>{bookedCounts[key] || 0}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
