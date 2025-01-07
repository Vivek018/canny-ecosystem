import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@canny_ecosystem/ui/card";
  import { SearchableSelectField } from "@canny_ecosystem/ui/forms";
  import {
    transformStringArrayIntoOptions,
    type ImportEmployeeBankingHeaderSchemaObject,
  } from "@canny_ecosystem/utils";
  import { type FieldMetadata, getInputProps } from "@conform-to/react";
  import { useEffect, useState } from "react";
  import Papa from "papaparse";
  
  type FieldsType = {
    [K in keyof typeof ImportEmployeeBankingHeaderSchemaObject.shape]: FieldMetadata<
      (typeof ImportEmployeeBankingHeaderSchemaObject.shape)[K]["_type"],
      (typeof ImportEmployeeBankingHeaderSchemaObject.shape)[K],
      string[]
    >;
  };
  
  export function EmployeeBankingImportHeader({
    fields,
    file,
  }: {
    fields: FieldsType;
    file: any;
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
            Map your fields with the Employee fields
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
              ...getInputProps(fields.account_holder_name, {
                type: "text",
              }),
            }}
            className="lowercase"
            options={transformStringArrayIntoOptions(headerArray)}
            labelProps={{
              children: "Account Holder Name",
            }}
            errors={fields.account_holder_name.errors}
          />
          <SearchableSelectField
            inputProps={{
              ...getInputProps(fields.account_number, {
                type: "text",
              }),
            }}
            className="lowercase"
            options={transformStringArrayIntoOptions(headerArray)}
            labelProps={{
              children: "Account Number",
            }}
            errors={fields.account_number.errors}
          />
          <SearchableSelectField
            inputProps={{
              ...getInputProps(fields.ifsc_code, {
                type: "text",
              }),
            }}
            className="lowercase"
            options={transformStringArrayIntoOptions(headerArray)}
            labelProps={{
              children: "ifsc Code",
            }}
            errors={fields.ifsc_code.errors}
          />
          <SearchableSelectField
            inputProps={{
              ...getInputProps(fields.account_type, {
                type: "text",
              }),
            }}
            className="lowercase"
            options={transformStringArrayIntoOptions(headerArray)}
            labelProps={{
              children: "Account Type",
            }}
            errors={fields.account_type.errors}
          />
          <SearchableSelectField
            className="capitalize"
            options={transformStringArrayIntoOptions(headerArray)}
            inputProps={{
              ...getInputProps(fields.bank_name, { type: "text" }),
            }}
            labelProps={{
              children: "Bank Name",
            }}
            errors={fields.bank_name.errors}
          />
          <SearchableSelectField
            className="capitalize"
            options={transformStringArrayIntoOptions(headerArray)}
            inputProps={{
              ...getInputProps(fields.branch_name, { type: "text" }),
            }}
            labelProps={{
              children: "Branch Name",
            }}
            errors={fields.branch_name.errors}
          />
            
          </div>
        </CardContent>
      </Card>
    );
  }
  