import { useImportStoreForLeaves } from "@/store/import";
import type { ImportLeavesDataType } from "@canny_ecosystem/supabase/queries";
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
  getValidDateForInput,
  ImportSingleLeavesDataSchema,
  leaveTypeArray,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import { useState } from "react";

export const UpdateImportedLeaves = ({
  indexToUpdate,
  dataToUpdate,
}: {
  indexToUpdate: number;
  dataToUpdate: ImportLeavesDataType;
}) => {
  const { importData, setImportData } = useImportStoreForLeaves();
  const [data, setData] = useState(dataToUpdate);

  const onChange = (key: keyof typeof dataToUpdate, value: string) => {
    setData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleUpdate = () => {
    const parsedResult = ImportSingleLeavesDataSchema.safeParse(data);

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
        Update Leaves
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
                placeholder: ".employee_code",
              }}
            />
            <Field
              inputProps={{
                type: "text",
                value: data.reason ?? 0,
                onChange: (e) => onChange("reason", e.target.value),
                placeholder: "Reason",
              }}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              inputProps={{
                type: "date",
                value: getValidDateForInput(data.start_date!),
                onChange: (e) => onChange("start_date", e.target.value),
                placeholder: "Start Date",
              }}
            />
            <Field
              inputProps={{
                type: "date",
                value: getValidDateForInput(data.end_date!),
                onChange: (e) => onChange("end_date", e.target.value),
                placeholder: "End Date",
              }}
            />
          </div>

          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Combobox
              options={transformStringArrayIntoOptions(
                leaveTypeArray as unknown as string[],
              )}
              value={data.leave_type ?? leaveTypeArray[0]}
              onChange={(value: string) => {
                onChange("leave_type", value);
              }}
              placeholder={"Select Leave Type"}
            />
            <Field
              className="gap-0"
              inputProps={{
                type: "text",
                value: data.email ?? "",
                onChange: (e) => onChange("email", e.target.value),
                placeholder: "Approval's Email",
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
