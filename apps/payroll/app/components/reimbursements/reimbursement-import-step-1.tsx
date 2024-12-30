import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { SearchableSelectField } from "@canny_ecosystem/ui/forms";
import { transformStringArrayIntoOptions } from "@canny_ecosystem/utils";
import { getInputProps } from "@conform-to/react";

export function ReimbursementImportStep1({
  fields,
  array,
}: {
  fields: any;
  array: any;
}) {
  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Map Fields</CardTitle>
        <CardDescription className="">
          Map your fields with the reimbursement fields
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 place-content-center justify-between gap-x-8 mt-10">
          <SearchableSelectField
            inputProps={{
              ...getInputProps(fields.employee_code, {
                type: "text",
              }),
            }}
            className="lowercase"
            options={transformStringArrayIntoOptions(array)}
            labelProps={{
              children: "Employee Code",
            }}
            errors={fields.employee_code.errors}
          />
          <SearchableSelectField
            inputProps={{
              ...getInputProps(fields.amount, {
                type: "text",
              }),
            }}
            className="lowercase"
            options={transformStringArrayIntoOptions(array)}
            labelProps={{
              children: "Amount",
            }}
            errors={fields.amount.errors}
          />
          <SearchableSelectField
            inputProps={{
              ...getInputProps(fields.submitted_date, {
                type: "text",
              }),
            }}
            className="lowercase"
            options={transformStringArrayIntoOptions(array)}
            labelProps={{
              children: "Submitted Date",
            }}
            errors={fields.submitted_date.errors}
          />
          <SearchableSelectField
            inputProps={{
              ...getInputProps(fields.email, {
                type: "text",
              }),
            }}
            className="lowercase"
            options={transformStringArrayIntoOptions(array)}
            labelProps={{
              children: "Approved By",
            }}
            errors={fields.email.errors}
          />
          <SearchableSelectField
            className="capitalize"
            options={transformStringArrayIntoOptions(array)}
            inputProps={{
              ...getInputProps(fields.status, { type: "text" }),
            }}
            labelProps={{
              children: fields.status.name,
            }}
            errors={fields.status.errors}
          />
          <SearchableSelectField
            className="capitalize"
            options={transformStringArrayIntoOptions(array)}
            inputProps={{
              ...getInputProps(fields.is_deductible, { type: "text" }),
            }}
            labelProps={{
              children: "Is Deductible",
            }}
            errors={fields.is_deductible.errors}
          />
        </div>
      </CardContent>
    </Card>
  );
}
