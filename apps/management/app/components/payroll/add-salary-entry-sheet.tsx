import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@canny_ecosystem/ui/sheet";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useState } from "react";
import type { PayrollFieldsDatabaseRow } from "@canny_ecosystem/supabase/types";
import {
  Combobox,
  type ComboboxSelectOption,
} from "@canny_ecosystem/ui/combobox";
import { Label } from "@canny_ecosystem/ui/label";
import { Input } from "@canny_ecosystem/ui/input";
import { Button, buttonVariants } from "@canny_ecosystem/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@canny_ecosystem/ui/dialog";
import { Icon } from "@canny_ecosystem/ui/icon";
import {
  componentTypeArray,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import { useSearchParams } from "@remix-run/react";

export function AddSalaryEntrySheet({
  triggerChild,
  salaryEntry,
  allEmployeeOptions,
  payrollFields,
  payrollId,
  allSiteOptions,
}: {
  triggerChild: React.ReactNode;
  salaryEntry: any;
  payrollFields: PayrollFieldsDatabaseRow[];
  payrollId: string;
  allSiteOptions: ComboboxSelectOption[];
  allEmployeeOptions: ComboboxSelectOption[];
}) {
  const [open, setOpen] = useState<boolean>(false);
  const [innerOpen, setInnerOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const [site, setSite] = useState("");
  const [employee, setEmployee] = useState("");
  const [presents, setPresents] = useState("");

  const [addFieldName, setAddFieldName] = useState("");
  const [addFieldType, setAddFieldType] = useState("");
  const [addFieldAmount, setAddFieldAmount] = useState(0);

  const [fieldConfigs, setFieldConfigs] = useState(() =>
    payrollFields.map((field) => ({
      key: field.name,
      type: field.type,
      amount: 0,
    }))
  );

  const handleFinalSubmit = () => {
    const finalData = {
      payroll_id: payrollId,
      employee_id: employee,
      present_days: presents,
      salary_data: fieldConfigs,
    };
    console.log(finalData);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        asChild
        className={cn("cursor-pointer py-2", !salaryEntry && "hidden")}
      >
        {triggerChild}
      </SheetTrigger>
      <SheetContent className="flex flex-col w-[600px] h-full">
        <SheetHeader className="px-6 pt-4 pb-8 flex-shrink-0">
          <SheetTitle className="flex justify-between">
            <div>
              <h1 className="text-primary text-3xl">Add Salary Entry</h1>
            </div>
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <div className="mb-8 flex flex-col gap-1">
            <Label className="text-sm font-medium">Site</Label>
            <Combobox
              options={allSiteOptions}
              placeholder="Select Site"
              value={site}
              onChange={(value: string) => {
                if (value?.length) {
                  searchParams.set("site", value);
                  setSite(value);
                }
                setSearchParams(searchParams);
              }}
            />
          </div>
          <div className="w-full grid grid-cols-2 gap-4 mb-8">
            <div className="mb-8 flex flex-col gap-1">
              <Label className="text-sm font-medium">Employee</Label>
              <Combobox
                options={allEmployeeOptions}
                placeholder="Select Employee"
                value={employee}
                onChange={(value: string) => {
                  setEmployee(value);
                }}
              />
            </div>
            <div className="mb-8 flex flex-col gap-1">
              <Label className="text-sm font-medium">Present Days</Label>
              <Input
                placeholder="Enter the present days"
                onChange={(e) => setPresents(e.target.value)}
              />
            </div>
          </div>
          {fieldConfigs.map((field) => (
            <div key={field.key} className="flex flex-col relative">
              <div className="flex flex-row justify-between items-center">
                <div className="flex gap-1">
                  <label className="text-sm text-muted-foreground capitalize">
                    {field.key}
                  </label>
                </div>
                {/* <Button
                  variant={"ghost"}
                  onClick={() =>
                    setFieldConfigs((prev) =>
                      prev.filter((f) => f.key !== field.key)
                    )
                  }
                  className="p-0 h-0 text-destructive text-xs font-extrabold"
                  title="Remove field"
                >
                  ✕
                </Button> */}
              </div>

              <Input
                value={field.amount}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setFieldConfigs((prev) =>
                    prev.map((f) =>
                      f.key === field.key ? { ...f, amount: value } : f
                    )
                  );
                }}
                placeholder={"Enter Amount"}
              />
            </div>
          ))}
          <Dialog open={innerOpen} onOpenChange={setInnerOpen}>
            <DialogTrigger asChild className="mt-3">
              <Button
                variant={"primary-outline"}
                className="w-full gap-2"
                onClick={() => {
                  setOpen(true);
                }}
              >
                <Icon
                  name="plus"
                  size="lg"
                  className="shrink-0 flex justify-center items-center"
                />
                Add Payroll Field
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader className="mb-2">
                <DialogTitle>Add a field</DialogTitle>
                <DialogDescription>You can add payroll field</DialogDescription>
              </DialogHeader>
              <Input
                type="text"
                placeholder="Field Name"
                value={addFieldName}
                onChange={(e) => {
                  setAddFieldName(e.target.value);
                }}
              />
              <Combobox
                options={transformStringArrayIntoOptions(
                  componentTypeArray as unknown as string[]
                )}
                placeholder="Select Field Type"
                value={addFieldType}
                onChange={(value: string) => {
                  setAddFieldType(value);
                }}
              />
              <Input
                type="number"
                placeholder="Field Amount"
                value={addFieldAmount}
                onChange={(e) => {
                  setAddFieldAmount(Number(e.target.value));
                }}
              />
              <DialogFooter className="mt-2">
                <DialogClose
                  className={buttonVariants({ variant: "secondary" })}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </DialogClose>
                <Button
                  onClick={() => {
                    setFieldConfigs((prev) => [
                      ...prev,
                      {
                        key: addFieldName as string,
                        type: addFieldType as "earning" | "deduction",
                        amount: addFieldAmount as number,
                      },
                    ]);
                    setInnerOpen(false);
                  }}
                >
                  Set
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <SheetFooter className="mt-auto flex-shrink-0">
          <SheetClose asChild>
            <Button variant={"default"} onClick={handleFinalSubmit}>
              Add
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
