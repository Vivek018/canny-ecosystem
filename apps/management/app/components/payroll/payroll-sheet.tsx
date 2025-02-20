import { useEffect, useState } from "react";
import {
  type PayrollEmployeeData,
  PayrollSchema,
} from "@canny_ecosystem/utils";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { Field, type ListOfErrors } from "@canny_ecosystem/ui/forms";
import { Form } from "@remix-run/react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@canny_ecosystem/ui/sheet";
import { TableCell, TableRow } from "@canny_ecosystem/ui/table";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { flexRender } from "@tanstack/react-table";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { FormButtons } from "../form/form-buttons";

type deductionAndEarning = {
  title: string;
  inputPropField: any;
  placeholder: string;
  errors: ListOfErrors;
  value: any;
};

export function PayrollSheet({
  row,
  rowData,
  editable,
}: { row: any; rowData: PayrollEmployeeData; editable: boolean }) {
  const [_resetKey, setResetKey] = useState(Date.now());
  const [netPay, setNetPay] = useState(0);

  // initial values
  const initialValues = { gross_pay: rowData.gross_pay ?? 0 };

  const templateComponents: {
    paymentTemplateComponentId: string;
    name: string;
  }[] = [];
  rowData.templateComponents?.map(
    (row: {
      amount: number;
      paymentTemplateComponentId: string;
      name: string;
    }) => {
      const { paymentTemplateComponentId, name } = row;
      initialValues[paymentTemplateComponentId] = row.amount;
      templateComponents.push({ paymentTemplateComponentId, name });
    },
  );

  const [form, fields] = useForm({
    id: rowData.employee_id,
    constraint: getZodConstraint(PayrollSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: PayrollSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      site_id: rowData.site_id,
      employee_id: rowData.employee_id,
      payrollId: rowData.payrollId,
      templateComponents: JSON.stringify(templateComponents),
    },
  });

  const earnings: deductionAndEarning[] = [
    {
      title: "Gross Pay",
      inputPropField: fields.gross_pay,
      placeholder: "Enter gross pay",
      errors: fields.gross_pay.errors,
      value: fields.gross_pay.value,
    },
  ];

  const deductions: deductionAndEarning[] = [];

  // populating earnings and deductions from templateComponents
  rowData.templateComponents?.map((row: any) => {
    const { paymentTemplateComponentId, name } = row;
    const paymentFieldData = {
      title: name,
      inputPropField: fields[paymentTemplateComponentId],
      placeholder: `Enter ${name}`,
      errors: fields[paymentTemplateComponentId].errors,
      value: fields[paymentTemplateComponentId].value,
    };

    if (
      row.componentType === "deductions" ||
      row.componentType === "statutory_contribution"
    )
      deductions.push(paymentFieldData);
    else earnings.push(paymentFieldData);
  });

  useEffect(() => {
    let newNetPay = 0;
    for (const earning of earnings) newNetPay += Number(earning.value);
    for (const deduction of deductions) newNetPay -= Number(deduction.value);
    setNetPay(newNetPay);
  }, [
    fields.gross_pay.value,
    ...rowData.templateComponents.map(
      (row: { paymentTemplateComponentId: string }) =>
        fields[row.paymentTemplateComponentId].value,
    ),
  ]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <TableRow key={row.id} className="relative cursor-pointer select-text">
          {row.getVisibleCells().map((cell: any) => (
            <TableCell
              key={cell.id || Date.now()}
              className={cn(
                "px-3 md:px-4 py-2 hidden md:table-cell",
                cell.column.id === "name" &&
                  "sticky left-0 min-w-12 max-w-12 bg-card z-10",
              )}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      </SheetTrigger>
      <SheetContent className="w-[800px] flex flex-col h-full overflow-hidden">
        <SheetHeader className="m-5 flex-shrink-0">
          <SheetTitle className="flex justify-between">
            <div>
              <h1 className="text-primary text-3xl">{rowData.name}</h1>
              <h4 className="my-1 text-muted-foreground text-sm">
                Employee code : {rowData.employee_code ?? "--"}
              </h4>
            </div>

            <div className="flex flex-col items-end justify-around">
              <h2 className="text-xl text-muted-foreground">Net Pay</h2>
              <p className="font-bold">Rs {netPay}</p>
            </div>
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-5">
          <FormProvider context={form.context}>
            <Form
              method="POST"
              {...getFormProps(form)}
              className="flex flex-col"
              action="/payroll/run-payroll/update-payroll-entry"
            >
              <input {...getInputProps(fields.site_id, { type: "hidden" })} />
              <input
                {...getInputProps(fields.employee_id, { type: "hidden" })}
              />
              <input {...getInputProps(fields.payrollId, { type: "hidden" })} />
              <input
                {...getInputProps(fields.templateComponents, {
                  type: "hidden",
                })}
              />
              <div className="flex justify-between">
                <h3 className="my-3 text-muted-foreground font-semibold">
                  Paid Days
                </h3>
                <p className="my-3 font-bold">{rowData.present_days ?? "--"}</p>
              </div>
              <hr />

              {/* EARNINGS */}
              <div className="flex justify-between">
                <h3 className="my-3 text-green font-semibold">
                  (+) EARNINGS (in Rs)
                </h3>
                <p className="my-3 font-bold">Amount</p>
              </div>
              <hr />
              {earnings?.map((earning, key) => {
                return (
                  <div className="flex justify-between" key={key.toString()}>
                    <div>
                      <h3 className="my-3 text-muted-foreground font-semibold capitalize">
                        {earning.title}
                      </h3>
                    </div>
                    <div className="text-end font-semibold">
                      <Field
                        inputProps={{
                          ...getInputProps(earning.inputPropField, {
                            type: "number",
                          }),
                          className: "capitalize",
                          placeholder: earning.placeholder,
                          readOnly: !editable,
                        }}
                        errors={earning.errors}
                      />
                    </div>
                  </div>
                );
              })}
              <hr />

              {/* DEDUCTIONS */}
              <div className="flex justify-between">
                <h3 className="my-3 text-destructive font-semibold">
                  (-) DEDUCTION (in Rs)
                </h3>
                <p className="my-3 font-bold">Amount</p>
              </div>
              <hr />
              {deductions?.map((deduction: deductionAndEarning, key) => {
                return (
                  <div className="flex justify-between" key={key.toString()}>
                    <div>
                      <h3 className="my-3 text-muted-foreground font-semibold capitalize">
                        {deduction.title}
                      </h3>
                    </div>
                    <div className="text-end font-semibold">
                      <Field
                        inputProps={{
                          ...getInputProps(deduction.inputPropField, {
                            type: "number",
                          }),
                          className: "capitalize",
                          placeholder: deduction.placeholder,
                          readOnly: !editable,
                        }}
                        errors={deduction.errors}
                      />
                    </div>
                  </div>
                );
              })}
              <hr />

              <div className="flex justify-between">
                <h3 className="my-3 text-muted-foreground font-semibold">
                  Net Pay
                </h3>
                <p className="font-bold">Rs {netPay}</p>
              </div>
            </Form>
          </FormProvider>
        </div>
        <SheetFooter className="mt-6 flex-shrink-0">
          <SheetClose asChild>
            {editable && (
              <FormButtons
                form={form}
                setResetKey={setResetKey}
                isSingle={true}
              />
            )}
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
