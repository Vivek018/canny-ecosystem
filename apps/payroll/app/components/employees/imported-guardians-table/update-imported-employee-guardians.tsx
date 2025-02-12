import { useImportStoreForEmployeeGuardians } from "@/store/import";
import type { ImportEmployeeGuardiansDataType } from "@canny_ecosystem/supabase/queries";
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
  genderArray,
  ImportSingleEmployeeGuardiansDataSchema,
  relationshipArray,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import { useState } from "react";

export const UpdateImportedEmployee = ({
  indexToUpdate,
  dataToUpdate,
}: {
  indexToUpdate: number;
  dataToUpdate: ImportEmployeeGuardiansDataType;
}) => {
  const { importData, setImportData } = useImportStoreForEmployeeGuardians();
  const convertToBoolean = (value: unknown): boolean => {
    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }
    return Boolean(value);
  };
  
  const initialData = {
    ...dataToUpdate,
    address_same_as_employee: convertToBoolean(dataToUpdate.address_same_as_employee),
    is_emergency_contact: convertToBoolean(dataToUpdate.is_emergency_contact),
  };
  const [data, setData] = useState(initialData);

  const onChange = (key: keyof typeof dataToUpdate, value: string) => {
    setData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleUpdate = () => {
    const parsedResult =
      ImportSingleEmployeeGuardiansDataSchema.safeParse(data);

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
            <Combobox
              options={transformStringArrayIntoOptions(
                relationshipArray as unknown as string[]
              )}
              value={data.relationship ?? relationshipArray[0]}
              onChange={(value: string) => {
                onChange("relationship", value);
              }}
              placeholder={"Select Relation"}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              inputProps={{
                type: "text",
                value: data.first_name!,
                onChange: (e) => onChange("first_name", e.target.value),
                placeholder: "First Name",
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
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              inputProps={{
                type: "date",
                value: data.date_of_birth!,
                onChange: (e) => onChange("date_of_birth", e.target.value),
                placeholder: "Date of Birth",
              }}
            />
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
          </div>

          <div>
            <CheckboxField
              buttonProps={{
                form: "",
                type: "button",
                name: "is_emergency_contact",
                checked: data.is_emergency_contact ?? false,
                onCheckedChange: (state) => {
                  onChange("is_emergency_contact", String(state));
                },
              }}
              labelProps={{
                children: "Is Emergency Contact?",
              }}
            />
          </div>
          <div>
            <CheckboxField
              buttonProps={{
                form: "",
                type: "button",
                name: "Address same as Employee",
                checked: data.address_same_as_employee ?? false,
                onCheckedChange: (state) => {
                  onChange("address_same_as_employee", String(state));
                },
              }}
              labelProps={{
                children: "Address same as Employee?",
              }}
            />
          </div>

          <div>
            <Field
              className="gap-0"
              inputProps={{
                type: "email",
                value: data.email ?? "",
                onChange: (e) => onChange("email", e.target.value),
                placeholder: "Email",
              }}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              inputProps={{
                type: "number",
                value: data.mobile_number!,
                onChange: (e) => onChange("mobile_number", e.target.value),
                placeholder: "Mobile Number",
              }}
            />
            <Field
              className="gap-0 -mt-1"
              inputProps={{
                type: "number",
                value: data.alternate_mobile_number!,
                onChange: (e) =>
                  onChange("alternate_mobile_number", e.target.value),
                placeholder: "Alternate Mobile Number",
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
