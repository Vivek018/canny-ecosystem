import { useImportStoreForEmployeeAttendance } from "@/store/import";
import type { ImportEmployeeAttendanceDataType } from "@canny_ecosystem/supabase/queries";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@canny_ecosystem/ui/alert-dialog";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Field } from "@canny_ecosystem/ui/forms";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { ImportSingleEmployeeAttendanceDataSchema } from "@canny_ecosystem/utils";
import { useState } from "react";

export const UpdateImportedEmployeeAttendance = ({
  indexToUpdate,
  dataToUpdate,
}: {
  indexToUpdate: number;
  dataToUpdate: ImportEmployeeAttendanceDataType;
}) => {
  const { importData, setImportData } = useImportStoreForEmployeeAttendance();
  const [data, setData] = useState(dataToUpdate);

  const onChange = (key: keyof typeof dataToUpdate, value: string) => {
    setData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleUpdate = () => {
    const parsedResult =
      ImportSingleEmployeeAttendanceDataSchema.safeParse(data);

    if (parsedResult.success) {
      setImportData({
        data: importData.data?.map((item, index) =>
          index === indexToUpdate ? data : item,
        ),
      });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "full" }),
          "text-[13px] h-9",
        )}
      >
        Update Attendance
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update the data here</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              inputProps={{
                type: "number",
                value: data.working_days ?? 0,
                onChange: (e) => onChange("working_days", e.target.value),
                placeholder: "Working Days",
              }}
            />
            <Field
              inputProps={{
                type: "number",
                value: data.present_days ?? 0,
                onChange: (e) => onChange("present_days", e.target.value),
                placeholder: "Presents Days",
              }}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              inputProps={{
                type: "number",
                value: data.working_hours ?? 0,
                onChange: (e) => onChange("working_hours", e.target.value),
                placeholder: "Working Hours",
              }}
            />
            <Field
              inputProps={{
                type: "number",
                value: data.overtime_hours ?? 0,
                onChange: (e) => onChange("overtime_hours", e.target.value),
                placeholder: "Overtime Hours",
              }}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              inputProps={{
                type: "number",
                value: data.absent_days ?? 0,
                onChange: (e) => onChange("absent_days", e.target.value),
                placeholder: "Absent Days",
              }}
            />
            <Field
              inputProps={{
                type: "number",
                value: data.paid_holidays ?? 0,
                onChange: (e) => onChange("paid_holidays", e.target.value),
                placeholder: "Paid Holidays",
              }}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              inputProps={{
                type: "number",
                value: data.paid_holidays ?? 0,
                onChange: (e) => onChange("paid_leaves", e.target.value),
                placeholder: "Paid Leaves",
              }}
            />
            <Field
              inputProps={{
                type: "number",
                value: data.casual_leaves ?? 0,
                onChange: (e) => onChange("casual_leaves", e.target.value),
                placeholder: "Casual Leaves",
              }}
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "default" }))}
            onClick={handleUpdate}
            onSelect={handleUpdate}
          >
            Update
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
