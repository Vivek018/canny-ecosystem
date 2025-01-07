import { useImportStoreForEmployeeStatutory } from "@/store/import";
import type { ImportEmployeeStatutoryDataType } from "@canny_ecosystem/supabase/queries";
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
import {
  ImportSingleEmployeeStatutoryDataSchema,
} from "@canny_ecosystem/utils";
import { useState } from "react";

export const UpdateImportedEmployee = ({
  indexToUpdate,
  dataToUpdate,
}: {
  indexToUpdate: number;
  dataToUpdate: ImportEmployeeStatutoryDataType;
}) => {
  const { importData, setImportData } = useImportStoreForEmployeeStatutory();
  const [data, setData] = useState(dataToUpdate);

  const onChange = (key: keyof typeof dataToUpdate, value: string) => {
    setData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleUpdate = () => {
    const parsedResult =
      ImportSingleEmployeeStatutoryDataSchema.safeParse(data);

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
                type: "number",
                value: data.aadhaar_number!,
                onChange: (e) => onChange("aadhaar_number", e.target.value),
                placeholder: "Aadhaar Number",
              }}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              className="gap-0 -mt-1"
              inputProps={{
                type: "text",
                value: data.pan_number!,
                onChange: (e) => onChange("pan_number", e.target.value),
                placeholder: "Pan Number",
              }}
            />
            <Field
              className="gap-0 -mt-1"
              inputProps={{
                type: "text",
                value: data.uan_number!,
                onChange: (e) => onChange("uan_number", e.target.value),
                placeholder: "Uan Number",
              }}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              className="gap-0 -mt-1"
              inputProps={{
                type: "text",
                value: data.pf_number!,
                onChange: (e) => onChange("pf_number", e.target.value),
                placeholder: "Pf Number",
              }}
            />
            <Field
              className="gap-0 -mt-1"
              inputProps={{
                type: "text",
                value: data.esic_number!,
                onChange: (e) => onChange("esic_number", e.target.value),
                placeholder: "esic Number",
              }}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              className="gap-0 -mt-1"
              inputProps={{
                type: "number",
                value: data.driving_license_number!,
                onChange: (e) => onChange("driving_license_number", e.target.value),
                placeholder: "Driving License Number",
              }}
            />
            <Field
              className="gap-0 -mt-1"
              inputProps={{
                type: "date",
                value: data.driving_license_expiry!,
                onChange: (e) => onChange("driving_license_expiry", e.target.value),
                placeholder: "Driving License Expiry Date",
              }}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              className="gap-0 -mt-1"
              inputProps={{
                type: "text",
                value: data.passport_number!,
                onChange: (e) => onChange("passport_number", e.target.value),
                placeholder: "Passport Number",
              }}
            />
            <Field
              className="gap-0 -mt-1"
              inputProps={{
                type: "date",
                value: data.passport_expiry!,
                onChange: (e) => onChange("passport_expiry", e.target.value),
                placeholder: "Passport Expiry Date",
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
