import { useImportStoreForSalaryPayroll } from "@/store/import";
import type { ImportSalaryPayrollDataType } from "@canny_ecosystem/supabase/queries";
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
import { ImportSingleSalaryPayrollDataSchema } from "@canny_ecosystem/utils";
import { useState } from "react";

export const UpdateImportedSalaryPayroll = ({
  indexToUpdate,
  dataToUpdate,
}: {
  indexToUpdate: number;
  dataToUpdate: ImportSalaryPayrollDataType;
}) => {
  const { importData, setImportData } = useImportStoreForSalaryPayroll();
  const [data, setData] = useState(dataToUpdate);

  const onChange = (key: keyof typeof dataToUpdate, value: string) => {
    setData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleUpdate = () => {
    const parsedResult = ImportSingleSalaryPayrollDataSchema.safeParse(data);

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
        Update Payroll
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
                value: data.total_days ?? 0,
                onChange: (e) => onChange("total_days", e.target.value),
                placeholder: "Total days",
              }}
            />
            <Field
              inputProps={{
                type: "number",
                value: data.present_days ?? 0,
                onChange: (e) => onChange("present_days", e.target.value),
                placeholder: "Present Days",
              }}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              inputProps={{
                type: "number",
                value: data.basic ?? 0,
                onChange: (e) => onChange("basic", e.target.value),
                placeholder: "Basic",
              }}
            />
            <Field
              inputProps={{
                type: "number",
                value: data.hra ?? 0,
                onChange: (e) => onChange("hra", e.target.value),
                placeholder: "HRA",
              }}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              inputProps={{
                type: "number",
                value: data.lta ?? 0,
                onChange: (e) => onChange("lta", e.target.value),
                placeholder: "LTA",
              }}
            />
            <Field
              inputProps={{
                type: "number",
                value: data.bonus ?? 0,
                onChange: (e) => onChange("bonus", e.target.value),
                placeholder: "Bonus",
              }}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              inputProps={{
                type: "number",
                value: data.others ?? 0,
                onChange: (e) => onChange("others", e.target.value),
                placeholder: "Others",
              }}
            />
            <Field
              inputProps={{
                type: "number",
                value: data.pf ?? 0,
                onChange: (e) => onChange("pf", e.target.value),
                placeholder: "Pf",
              }}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              inputProps={{
                type: "number",
                value: data.esic ?? 0,
                onChange: (e) => onChange("esic", e.target.value),
                placeholder: "Esic",
              }}
            />
            <Field
              inputProps={{
                type: "number",
                value: data.pt ?? 0,
                onChange: (e) => onChange("pt", e.target.value),
                placeholder: "Pt",
              }}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              inputProps={{
                type: "number",
                value: data.lwf ?? 0,
                onChange: (e) => onChange("lwf", e.target.value),
                placeholder: "Lwf",
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
