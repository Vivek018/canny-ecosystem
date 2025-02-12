import { useImportStoreForEmployeeAddress } from "@/store/import";
import type { ImportEmployeeAddressDataType } from "@canny_ecosystem/supabase/queries";
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
import { CheckboxField, Field } from "@canny_ecosystem/ui/forms";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { ImportSingleEmployeeAddressDataSchema } from "@canny_ecosystem/utils";
import { useState } from "react";

export const UpdateImportedEmployee = ({
  indexToUpdate,
  dataToUpdate,
}: {
  indexToUpdate: number;
  dataToUpdate: ImportEmployeeAddressDataType;
}) => {
  const { importData, setImportData } = useImportStoreForEmployeeAddress();
  const convertToBoolean = (value: unknown): boolean => {
    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }
    return Boolean(value);
  };

  const initialData = {
    ...dataToUpdate,
    is_primary: convertToBoolean(dataToUpdate.is_primary),
  };
  const [data, setData] = useState(initialData);
  const onChange = (key: keyof typeof dataToUpdate, value: string) => {
    setData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleUpdate = () => {
    const parsedResult = ImportSingleEmployeeAddressDataSchema.safeParse(data);

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
                value: data.address_type!,
                onChange: (e) => onChange("address_type", e.target.value),
                placeholder: "Address Type",
              }}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              className="gap-0 -mt-1"
              inputProps={{
                type: "text",
                value: data.address_line_1!,
                onChange: (e) => onChange("address_line_1", e.target.value),
                placeholder: "Address Line 1",
              }}
            />
            <Field
              className="gap-0 -mt-1"
              inputProps={{
                type: "text",
                value: data.address_line_2!,
                onChange: (e) => onChange("address_line_2", e.target.value),
                placeholder: "Address Line 2",
              }}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              className="gap-0 -mt-1"
              inputProps={{
                type: "text",
                value: data.city!,
                onChange: (e) => onChange("city", e.target.value),
                placeholder: "City",
              }}
            />
            <Field
              className="gap-0 -mt-1"
              inputProps={{
                type: "number",
                value: data.pincode!,
                onChange: (e) => onChange("pincode", e.target.value),
                placeholder: "Pincode",
              }}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              className="gap-0 -mt-1"
              inputProps={{
                type: "text",
                value: data.state!,
                onChange: (e) => onChange("state", e.target.value),
                placeholder: "State",
              }}
            />
            <Field
              className="gap-0 -mt-1"
              inputProps={{
                type: "text",
                value: data.country!,
                onChange: (e) => onChange("country", e.target.value),
                placeholder: "Country",
              }}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              className="gap-0 -mt-1"
              inputProps={{
                type: "text",
                value: data.latitude!,
                onChange: (e) => onChange("latitude", e.target.value),
                placeholder: "Latitude",
              }}
            />
            <Field
              className="gap-0 -mt-1"
              inputProps={{
                type: "text",
                value: data.longitude!,
                onChange: (e) => onChange("longitude", e.target.value),
                placeholder: "Longitude",
              }}
            />
          </div>

          <div>
            <CheckboxField
              buttonProps={{
                form: "",
                type: "button",
                name: "is_primary",
                checked: data.is_primary ?? false,
                onCheckedChange: (state) => {
                  onChange("is_primary", String(state));
                },
              }}
              labelProps={{
                children: "Is Primary?",
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
