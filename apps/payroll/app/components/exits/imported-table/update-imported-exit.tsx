import { useImportStoreForExit } from "@/store/import";
import type { ImportExitDataType } from "@canny_ecosystem/supabase/queries";
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
import { Field } from "@canny_ecosystem/ui/forms";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  capitalizeFirstLetter,
  exitReasonArray,
  getValidDateForInput,
  ImportSingleExitDataSchema,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import { useState } from "react";

export const UpdateImportedExit = ({
  indexToUpdate,
  dataToUpdate,
}: {
  indexToUpdate: number;
  dataToUpdate: ImportExitDataType;
}) => {
  const { importData, setImportData } = useImportStoreForExit();
  const [data, setData] = useState(dataToUpdate);

  const onChange = (key: keyof typeof dataToUpdate, value: string) => {
    setData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleUpdate = () => {
    const parsedResult = ImportSingleExitDataSchema.safeParse(data);

    if (parsedResult.success) {
      setImportData({
        data: importData.data?.map((item, index) =>
          index === indexToUpdate ? data : item,
        ),
      });
    }
  };

  const calculateTotal = () => {
    return (
      Number(data.bonus ?? 0) +
      Number(data.gratuity ?? 0) +
      Number(data.leave_encashment ?? 0) -
      Number(data.deduction ?? 0)
    );
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "full" }),
          "text-[13px] h-9",
        )}
      >
        Update Exit
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update the data here</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="flex flex-col gap-3">
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
                value: data.employee_name ?? 0,
                onChange: (e) => onChange("employee_name", e.target.value),
                placeholder: "Employee Name",
              }}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              inputProps={{
                type: "text",
                value: data.project_name ?? 0,
                onChange: (e) => onChange("project_name", e.target.value),
                placeholder: "Project Name",
              }}
            />
            <Field
              inputProps={{
                type: "text",
                value: data.project_site_name ?? 0,
                onChange: (e) => onChange("project_site_name", e.target.value),
                placeholder: "Project Site Name",
              }}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              inputProps={{
                type: "date",
                value: getValidDateForInput(data.last_working_day!),
                onChange: (e) => onChange("last_working_day", e.target.value),
                placeholder: "Last Working Day",
              }}
            />
            <Field
              inputProps={{
                type: "date",
                value: getValidDateForInput(data.final_settlement_date!),
                onChange: (e) =>
                  onChange("final_settlement_date", e.target.value),
                placeholder: "Final Settlement Date",
              }}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              inputProps={{
                type: "number",
                value: data.bonus ?? 0,
                onChange: (e) => onChange("bonus", e.target.value),
                placeholder: "Bonus",
              }}
            />
            <Field
              inputProps={{
                type: "number",
                value: data.leave_encashment ?? 0,
                onChange: (e) => onChange("leave_encashment", e.target.value),
                placeholder: "Leave Encashment",
              }}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              inputProps={{
                type: "number",
                value: data.gratuity ?? 0,
                onChange: (e) => onChange("gratuity", e.target.value),
                placeholder: "Gratuity",
              }}
            />
            <Field
              inputProps={{
                type: "number",
                value: data.deduction ?? 0,
                onChange: (e) => onChange("deduction", e.target.value),
                placeholder: "Deductions",
              }}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              inputProps={{
                type: "number",
                value: data.employee_payable_days ?? 0,
                onChange: (e) =>
                  onChange("employee_payable_days", e.target.value),
                placeholder: "Empoyee Payable Days",
              }}
            />
            <Field
              inputProps={{
                type: "number",
                value: data.organization_payable_days ?? 0,
                onChange: (e) =>
                  onChange("organization_payable_days", e.target.value),
                placeholder: "Organizational Payable Days",
              }}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Combobox
              options={transformStringArrayIntoOptions(
                exitReasonArray as unknown as string[],
              )}
              value={capitalizeFirstLetter(data.reason) ?? exitReasonArray[0]}
              onChange={(value: string) => {
                onChange("reason", value);
              }}
              placeholder={"Select reason"}
              className="capitalize"
            />
            <Field
              inputProps={{
                value: calculateTotal() ?? 0,
                placeholder: "Total",
                readOnly: true,
              }}
            />
          </div>
        </div>
        <div className="w-full">
          <Field
            inputProps={{
              type: "text",
              value: data.note ?? 0,
              onChange: (e) => onChange("note", e.target.value),
              placeholder: "Note",
            }}
          />
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
