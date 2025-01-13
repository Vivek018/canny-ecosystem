import { useImportStoreForEmployeeBankDetails } from "@/store/import";
import type { ImportEmployeeBankDetailsDataType } from "@canny_ecosystem/supabase/queries";
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
  accountTypeArray,
  ImportSingleEmployeeBankDetailsDataSchema,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import { useState } from "react";

export const UpdateImportedEmployee = ({
  indexToUpdate,
  dataToUpdate,
}: {
  indexToUpdate: number;
  dataToUpdate: ImportEmployeeBankDetailsDataType;
}) => {
  const { importData, setImportData } = useImportStoreForEmployeeBankDetails();
  const [data, setData] = useState(dataToUpdate);

  const onChange = (key: keyof typeof dataToUpdate, value: string) => {
    setData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleUpdate = () => {
    const parsedResult =
      ImportSingleEmployeeBankDetailsDataSchema.safeParse(data);

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
                value: data.account_holder_name!,
                onChange: (e) =>
                  onChange("account_holder_name", e.target.value),
                placeholder: "Account Holder Name",
              }}
            />
          </div>
          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              className="gap-0 -mt-1"
              inputProps={{
                type: "number",
                value: data.account_number!,
                onChange: (e) => onChange("account_number", e.target.value),
                placeholder: "Account Number",
              }}
            />
            <Field
              className="gap-0 -mt-1"
              inputProps={{
                type: "text",
                value: data.ifsc_code!,
                onChange: (e) => onChange("ifsc_code", e.target.value),
                placeholder: "ifsc Code",
              }}
            />
          </div>

          <div className="grid mb-5 grid-cols-2 place-content-center justify-between gap-3">
            <Combobox
              options={transformStringArrayIntoOptions(
                accountTypeArray as unknown as string[]
              )}
              value={data.account_type ?? accountTypeArray[0]}
              onChange={(value: string) => {
                onChange("account_type", value);
              }}
              placeholder={"Select Account Type"}
            />
          </div>

          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              className="gap-0 -mt-1"
              inputProps={{
                type: "text",
                value: data.bank_name!,
                onChange: (e) => onChange("bank_name", e.target.value),
                placeholder: "Bank Name",
              }}
            />
            <Field
              className="gap-0 -mt-1"
              inputProps={{
                type: "text",
                value: data.branch_name!,
                onChange: (e) => onChange("branch_name", e.target.value),
                placeholder: "Branch Name",
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
