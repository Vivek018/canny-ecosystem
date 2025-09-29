import { useImportStoreForEmployeeProjectAssignments } from "@/store/import";
import type { ImportEmployeeProjectAssignmentsDataType } from "@canny_ecosystem/supabase/queries";
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
  assignmentTypeArray,
  positionArray,
  skillLevelArray,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import { useState } from "react";

export const UpdateImportedEmployee = ({
  indexToUpdate,
  dataToUpdate,
}: {
  indexToUpdate: number;
  dataToUpdate: ImportEmployeeProjectAssignmentsDataType;
}) => {
  const { importData, setImportData } =
    useImportStoreForEmployeeProjectAssignments();
  const convertToBoolean = (value: unknown): boolean => {
    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }
    return Boolean(value);
  };

  const initialData = {
    ...dataToUpdate,
    probation_period: convertToBoolean(dataToUpdate.probation_period),
  };
  const [data, setData] = useState(initialData);

  const onChange = (key: keyof typeof dataToUpdate, value: string) => {
    setData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleUpdate = () => {
    // const parsedResult =
    //   ImportSingleEmployeeProjectAssignmentsDataSchema.safeParse(data); // delete this entire file and replace it with work details import
    const parsedResult = { success: true, data };

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
                value: data.employee_code ?? 0,
                onChange: (e) => onChange("employee_code", e.target.value),
                placeholder: "Employee Code",
              }}
            />
            <Combobox
              options={transformStringArrayIntoOptions(
                skillLevelArray as unknown as string[],
              )}
              value={data.skill_level ?? skillLevelArray[0]}
              onChange={(value: string) => {
                onChange("skill_level", value);
              }}
              placeholder={"Select Skill Level"}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              className="gap-1 -mt-1"
              inputProps={{
                type: "date",
                value: data.start_date!,
                onChange: (e) => onChange("start_date", e.target.value),
                placeholder: "Start Date",
              }}
              labelProps={{ children: "Start Date" }}
            />
            <Field
              className="gap-1 -mt-1"
              inputProps={{
                type: "date",
                value: data.end_date!,
                onChange: (e) => onChange("end_date", e.target.value),
                placeholder: "End Date",
              }}
              labelProps={{ children: "End Date" }}
            />
          </div>

          <div className="grid mb-5 grid-cols-2 place-content-center justify-between gap-3">
            <Combobox
              options={transformStringArrayIntoOptions(
                assignmentTypeArray as unknown as string[],
              )}
              value={data.assignment_type ?? assignmentTypeArray[0]}
              onChange={(value: string) => {
                onChange("assignment_type", value);
              }}
              placeholder={"Select Assignment Type"}
            />
            <Combobox
              options={transformStringArrayIntoOptions(
                positionArray as unknown as string[],
              )}
              value={data.position ?? positionArray[1]}
              onChange={(value: string) => {
                onChange("position", value);
              }}
              placeholder={"Select Position"}
            />
          </div>

          <div>
            <CheckboxField
              buttonProps={{
                form: "",
                type: "button",
                name: "probation_period",
                checked: data.probation_period ?? false,
                onCheckedChange: (state) => {
                  onChange("probation_period", String(state));
                },
              }}
              labelProps={{
                children: "Probation Period",
              }}
            />
            <Field
              className="gap-1 -mt-1"
              inputProps={{
                type: "date",
                value: data.probation_end_date!,
                onChange: (e) => onChange("probation_end_date", e.target.value),
                placeholder: "Probation End Date",
              }}
              labelProps={{ children: "Probation End Date" }}
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
