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
import { Combobox } from "@canny_ecosystem/ui/combobox";
import { CheckboxField, Field } from "@canny_ecosystem/ui/forms";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  attendanceHolidayTypeArray,
  attendanceWorkShiftArray,
  ImportSingleEmployeeAttendanceDataSchema,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import { useState } from "react";

export const UpdateImportedEmployee = ({
  indexToUpdate,
  dataToUpdate,
}: {
  indexToUpdate: number;
  dataToUpdate: ImportEmployeeAttendanceDataType;
}) => {
  const { importData, setImportData } = useImportStoreForEmployeeAttendance();
  const convertToBoolean = (value: unknown): boolean => {
    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }
    return Boolean(value);
  };

  const initialData = {
    ...dataToUpdate,
    present: convertToBoolean(dataToUpdate.present),
    holiday: convertToBoolean(dataToUpdate.holiday),
  };

  const [data, setData] = useState(initialData);

  const onChange = (
    key: keyof typeof dataToUpdate,
    value: string | boolean,
  ) => {
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
        Update Employee
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update the data here</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="flex flex-col">
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              inputProps={{
                type: "text",
                value: data.employee_code ?? "",
                onChange: (e) => onChange("employee_code", e.target.value),
                placeholder: "Employee Code",
              }}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              inputProps={{
                type: "date",
                value: data.date!,
                onChange: (e) => onChange("date", e.target.value),
                placeholder: "Date",
              }}
            />
            <Field
              inputProps={{
                type: "number",
                value: data.no_of_hours!,
                onChange: (e) => onChange("no_of_hours", e.target.value),
                placeholder: "No of Hours",
              }}
            />
          </div>
          <div className="grid mb-5 grid-cols-2 place-content-center justify-between gap-3">
            <CheckboxField
              buttonProps={{
                form: "",
                type: "button",
                name: "present",
                checked: Boolean(data.present),
                onCheckedChange: (state) => {
                  onChange("present", Boolean(state));
                },
              }}
              labelProps={{
                children: "Present",
              }}
            />
            <CheckboxField
              buttonProps={{
                form: "",
                type: "button",
                name: "holiday",
                checked: Boolean(data.holiday),
                onCheckedChange: (state) => {
                  onChange("holiday", Boolean(state));
                },
              }}
              labelProps={{
                children: "Holiday",
              }}
            />
          </div>
          <div className="grid mb-5 grid-cols-2 place-content-center justify-between gap-3">
            <Combobox
              options={transformStringArrayIntoOptions(
                attendanceWorkShiftArray as unknown as string[],
              )}
              value={data.working_shift ?? attendanceWorkShiftArray[0]}
              onChange={(value: string) => {
                onChange("working_shift", value);
              }}
              placeholder={"Select Working Shift"}
            />
            <Combobox
              options={transformStringArrayIntoOptions(
                attendanceHolidayTypeArray as unknown as string[],
              )}
              value={data.holiday_type ?? attendanceHolidayTypeArray[0]}
              onChange={(value: string) => {
                onChange("holiday_type", value);
              }}
              placeholder={"Select Holiday Type"}
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
