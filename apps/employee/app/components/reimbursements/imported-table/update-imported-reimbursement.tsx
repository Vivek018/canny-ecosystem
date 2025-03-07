import { useImportStoreForReimbursement } from "@/store/import";
import type { ImportReimbursementDataType } from "@canny_ecosystem/supabase/queries";
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
  getValidDateForInput,
  ImportSingleReimbursementDataSchema,
  reimbursementStatusArray,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import { useState } from "react";

export const UpdateImportedReimbursement = ({
  indexToUpdate,
  dataToUpdate,
}: {
  indexToUpdate: number;
  dataToUpdate: ImportReimbursementDataType;
}) => {
  const { importData, setImportData } = useImportStoreForReimbursement();
  const [data, setData] = useState(dataToUpdate);

  const onChange = (key: keyof typeof dataToUpdate, value: string) => {
    setData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleUpdate = () => {
    const parsedResult = ImportSingleReimbursementDataSchema.safeParse(data);

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
        Update Reimbursement
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
                value: data.amount ?? 0,
                onChange: (e) => onChange("amount", e.target.value),
                placeholder: "Amount",
              }}
            />

            <Field
              inputProps={{
                type: "date",
                value: getValidDateForInput(data.submitted_date!),
                onChange: (e) => onChange("submitted_date", e.target.value),
                placeholder: "Submitted Date",
              }}
            />
          </div>

          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Combobox
              options={transformStringArrayIntoOptions(
                reimbursementStatusArray as unknown as string[],
              )}
              value={data.status ?? reimbursementStatusArray[0]}
              onChange={(value: string) => {
                onChange("status", value);
              }}
              placeholder={"Select Status"}
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

          <div>
            <CheckboxField
              buttonProps={{
                form: "",
                type: "button",
                name: "is_deductible",
                checked: data.is_deductible ?? false,
                onCheckedChange: (state) => {
                  onChange("is_deductible", String(state));
                },
              }}
              labelProps={{
                children: "Is Deductible?",
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
