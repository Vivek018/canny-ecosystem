import { useImportStoreForEmployeePersonals } from "@/store/import";
import type { ImportEmployeePersonalsDataType } from "@canny_ecosystem/supabase/queries";
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
  educationArray,
  genderArray,
  ImportSingleEmployeePersonalsDataSchema,
  maritalStatusArray,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import { useState } from "react";

export const UpdateImportedEmployee = ({
  indexToUpdate,
  dataToUpdate,
}: {
  indexToUpdate: number;
  dataToUpdate: ImportEmployeePersonalsDataType;
}) => {
  const { importData, setImportData } = useImportStoreForEmployeePersonals();
  const [data, setData] = useState(dataToUpdate);

  const onChange = (key: keyof typeof dataToUpdate, value: string) => {
    setData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleUpdate = () => {
    const parsedResult =
      ImportSingleEmployeePersonalsDataSchema.safeParse(data);

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
