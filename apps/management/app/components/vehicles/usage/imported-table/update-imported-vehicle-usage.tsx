import {
  useImportStoreForVehicleUsage,
} from "@/store/import";
import type {
  ImportVehicleUsageDataType,
} from "@canny_ecosystem/supabase/queries";
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
  ImportSingleVehicleUsageDataSchema,
} from "@canny_ecosystem/utils";
import { useState } from "react";

export const UpdateImportedVehicleUsage = ({
  indexToUpdate,
  dataToUpdate,
}: {
  indexToUpdate: number;
  dataToUpdate: ImportVehicleUsageDataType;
}) => {
  const { importData, setImportData } = useImportStoreForVehicleUsage();

  const [data, setData] = useState(dataToUpdate);

  const onChange = (key: keyof typeof dataToUpdate, value: string) => {
    setData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleUpdate = () => {
    const parsedResult = ImportSingleVehicleUsageDataSchema.safeParse(data);

    if (parsedResult.success) {
      setImportData({
        data: importData.data?.map((item: any, index: any) =>
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
        Update Usage
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
                value: data.kilometers ?? 0,
                onChange: (e) => onChange("kilometers", e.target.value),
                placeholder: "Kilometers",
              }}
            />

            <Field
              inputProps={{
                type: "number",
                value: data.fuel_in_liters ?? 0,
                onChange: (e) => onChange("fuel_in_liters", e.target.value),
                placeholder: "Fuel (L)",
              }}
            />
          </div>

          <div className="grid grid-cols-2 place-content-center justify-between gap-3">
            <Field
              inputProps={{
                type: "number",
                value: data.fuel_amount ?? 0,
                onChange: (e) => onChange("fuel_amount", e.target.value),
                placeholder: "Fuel Amount",
              }}
            />

            <Field
              inputProps={{
                type: "number",
                value: data.toll_amount ?? 0,
                onChange: (e) => onChange("toll_amount", e.target.value),
                placeholder: "Toll Amount",
              }}
            />
          </div>
          <Field
            inputProps={{
              type: "number",
              value: data.maintainance_amount ?? 0,
              onChange: (e) => onChange("maintainance_amount", e.target.value),
              placeholder: "Maintainance Amount",
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
