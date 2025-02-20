import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";

export function LeaveCountCards({
  leaveType,
}: {
  leaveType: {
    reduce: any;
    leave_type: string;
  };
}) {
  const cardInfo = [
    { title: "Casual Leaves", key: "casual_leave", available: 12, booked: 0 },
    { title: "Paid Leaves", key: "paid_leave", available: 10, booked: 0 },
    { title: "Unpaid Leaves", key: "unpaid_leave", available: 5, booked: 0 },
    {
      title: "Paternity Leaves",
      key: "paternity_leave",
      available: 7,
      booked: 0,
    },
    { title: "Sick Leaves", key: "sick_leave", available: 8, booked: 0 },
  ];

  const bookedCounts = leaveType.reduce(
    (acc: { [x: string]: any }, { leave_type }: any) => {
      acc[leave_type] = (acc[leave_type] || 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <div className="mb-5 grid grid-cols-5 gap-5">
      {cardInfo.map(({ title, available, key }) => (
        <Card
          key={title}
          className="w-full select-text cursor-auto dark:border-[1.5px] h-full flex flex-col justify-between"
        >
          <CardHeader className="flex flex-row space-y-0 items-center justify-center py-4">
            <CardTitle className="font-bold">{title}</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-2">
            <div className="flex justify-around">
              <p>Available</p> <p>{available}</p>
            </div>
            <div className="flex justify-around">
              <p>Booked</p> <p>{bookedCounts[key] || 0}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
