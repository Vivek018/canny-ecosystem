import { useImportStoreForEmployeeDetails } from "@/store/import";
import type { ImportEmployeeDetailsDataType } from "@canny_ecosystem/supabase/queries";
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
  educationArray,
  genderArray,
  ImportSingleEmployeeDetailsDataSchema,
  maritalStatusArray,
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
  dataToUpdate: ImportEmployeeDetailsDataType;
}) => {
  const { importData, setImportData } = useImportStoreForEmployeeDetails();
  const convertToBoolean = (value: unknown): boolean => {
    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }
    return Boolean(value);
  };

  const initialData = {
    ...dataToUpdate,
    is_active: convertToBoolean(dataToUpdate.is_active),
  };
  const [data, setData] = useState(initialData);

  const onChange = (key: keyof typeof dataToUpdate, value: string) => {
    setData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleUpdate = () => {
    const parsedResult = ImportSingleEmployeeDetailsDataSchema.safeParse(data);

    if (parsedResult.success) {
      setImportData({
        data: importData.data?.map((item, index) =>
          index === indexToUpdate ? data : item
        ),
      });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "full" }),
          "text-[13px] h-9"
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
            <Field
              inputProps={{
                type: "text",
                value: data.first_name!,
                onChange: (e) => onChange("first_name", e.target.value),
                placeholder: "First Name",
              }}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              className="gap-0 -mt-1"
              inputProps={{
                type: "text",
                value: data.middle_name!,
                onChange: (e) => onChange("middle_name", e.target.value),
                placeholder: "Middle Name",
              }}
            />
            <Field
              className="gap-0 -mt-1"
              inputProps={{
                type: "text",
                value: data.last_name!,
                onChange: (e) => onChange("last_name", e.target.value),
                placeholder: "Last Name",
              }}
            />
          </div>

          <div className="grid mb-5 grid-cols-2 place-content-center justify-between gap-3">
            <Combobox
              options={transformStringArrayIntoOptions(
                genderArray as unknown as string[]
              )}
              value={data.gender ?? genderArray[0]}
              onChange={(value: string) => {
                onChange("gender", value);
              }}
              placeholder={"Select Gender"}
            />
            <Combobox
              options={transformStringArrayIntoOptions(
                educationArray as unknown as string[]
              )}
              value={data.education ?? educationArray[0]}
              onChange={(value: string) => {
                onChange("education", value);
              }}
              placeholder={"Select Eduation"}
            />
          </div>
          <div className="mb-5 grid grid-cols-1">
            <Combobox
              options={transformStringArrayIntoOptions(
                maritalStatusArray as unknown as string[]
              )}
              value={data.marital_status ?? maritalStatusArray[0]}
              onChange={(value: string) => {
                onChange("marital_status", value);
              }}
              placeholder={"Select Marital Status"}
            />
          </div>
          <div>
            <CheckboxField
              buttonProps={{
                form: "",
                type: "button",
                name: "is_active",
                checked: data.is_active ?? false,
                onCheckedChange: (state) => {
                  onChange("is_active", String(state));
                },
              }}
              labelProps={{
                children: "IS Active?",
              }}
            />
          </div>

          <div>
            <Field
              className="gap-0"
              inputProps={{
                type: "email",
                value: data.personal_email ?? "",
                onChange: (e) => onChange("personal_email", e.target.value),
                placeholder: "Personal Email",
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field
              className="gap-0"
              inputProps={{
                type: "number",
                value: data.primary_mobile_number ?? "",
                onChange: (e) =>
                  onChange("primary_mobile_number", e.target.value),
                placeholder: "Primary Mobile Number",
              }}
            />
            <Field
              className="gap-0"
              inputProps={{
                type: "number",
                value: data.secondary_mobile_number ?? "",
                onChange: (e) =>
                  onChange("secondary_mobile_number", e.target.value),
                placeholder: "Secondary Mobile Number",
              }}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Combobox
              options={transformStringArrayIntoOptions(
                skillLevelArray as unknown as string[]
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
                assignmentTypeArray as unknown as string[]
              )}
              value={data.assignment_type ?? assignmentTypeArray[0]}
              onChange={(value: string) => {
                onChange("assignment_type", value);
              }}
              placeholder={"Select Assignment Type"}
            />
            <Combobox
              options={transformStringArrayIntoOptions(
                positionArray as unknown as string[]
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
