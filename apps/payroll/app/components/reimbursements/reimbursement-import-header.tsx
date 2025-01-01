import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { SearchableSelectField } from "@canny_ecosystem/ui/forms";
import { type ImportReimbursementHeaderSchema, transformStringArrayIntoOptions } from "@canny_ecosystem/utils";
import { type FieldMetadata, getInputProps } from "@conform-to/react";
import { useEffect, useState } from "react";
import Papa from "papaparse";


type FieldsType = {
  [K in keyof typeof ImportReimbursementHeaderSchema.shape]: FieldMetadata<
    (typeof ImportReimbursementHeaderSchema.shape)[K]["_type"],
    (typeof ImportReimbursementHeaderSchema.shape)[K],
    string[]
  >;
};

export function ReimbursementImportHeader({
  fields,
  file
}: {
  fields: FieldsType;
  file:any
}) {

  const [headerArray, setHeaderArray] = useState<string[]>([]);

  useEffect(() => {
    if (file) {
      Papa.parse(file, {
        skipEmptyLines: true,
        complete: (results: any) => {
          const headers = results.data[0].filter(
            (header: string) => header !== null && header.trim() !== ""
          );
          setHeaderArray(headers);
        },
      });
    }
  }, [file]);
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
            options={transformStringArrayIntoOptions(headerArray)}
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
            options={transformStringArrayIntoOptions(headerArray)}
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
            options={transformStringArrayIntoOptions(headerArray)}
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
            options={transformStringArrayIntoOptions(headerArray)}
            labelProps={{
              children: "Approved By",
            }}
            errors={fields.email.errors}
          />
          <SearchableSelectField
            className="capitalize"
            options={transformStringArrayIntoOptions(headerArray)}
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
            options={transformStringArrayIntoOptions(headerArray)}
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
