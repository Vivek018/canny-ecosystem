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
  type ImportEmployeeStatutoryHeaderSchemaObject,
} from "@canny_ecosystem/utils";
import { type FieldMetadata, getInputProps } from "@conform-to/react";
import { useEffect, useState } from "react";
import Papa from "papaparse";

type FieldsType = {
  [K in keyof typeof ImportEmployeeStatutoryHeaderSchemaObject.shape]: FieldMetadata<
    (typeof ImportEmployeeStatutoryHeaderSchemaObject.shape)[K]["_type"],
    (typeof ImportEmployeeStatutoryHeaderSchemaObject.shape)[K],
    string[]
  >;
};

export function EmployeeStatutoryImportHeader({
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
              ...getInputProps(fields.aadhaar_number, {
                type: "text",
              }),
            }}
            className="lowercase"
            options={transformStringArrayIntoOptions(headerArray)}
            labelProps={{
              children: "Aadhaar Number",
            }}
            errors={fields.aadhaar_number.errors}
          />
          <SearchableSelectField
            inputProps={{
              ...getInputProps(fields.pan_number, {
                type: "text",
              }),
            }}
            className="lowercase"
            options={transformStringArrayIntoOptions(headerArray)}
            labelProps={{
              children: "Pan Number",
            }}
            errors={fields.pan_number.errors}
          />
          <SearchableSelectField
            inputProps={{
              ...getInputProps(fields.uan_number, {
                type: "text",
              }),
            }}
            className="lowercase"
            options={transformStringArrayIntoOptions(headerArray)}
            labelProps={{
              children: "uan Number",
            }}
            errors={fields.uan_number.errors}
          />
          <SearchableSelectField
            inputProps={{
              ...getInputProps(fields.pf_number, {
                type: "text",
              }),
            }}
            className="lowercase"
            options={transformStringArrayIntoOptions(headerArray)}
            labelProps={{
              children: "Pf Number",
            }}
            errors={fields.pf_number.errors}
          />
          <SearchableSelectField
            className="capitalize"
            options={transformStringArrayIntoOptions(headerArray)}
            inputProps={{
              ...getInputProps(fields.esic_number, { type: "text" }),
            }}
            labelProps={{
              children: "esic Number",
            }}
            errors={fields.esic_number.errors}
          />
          <SearchableSelectField
            className="capitalize"
            options={transformStringArrayIntoOptions(headerArray)}
            inputProps={{
              ...getInputProps(fields.driving_license_number, { type: "text" }),
            }}
            labelProps={{
              children: "Driving License Number",
            }}
            errors={fields.driving_license_number.errors}
          />
          <SearchableSelectField
            className="capitalize"
            options={transformStringArrayIntoOptions(headerArray)}
            inputProps={{
              ...getInputProps(fields.driving_license_expiry, { type: "text" }),
            }}
            labelProps={{
              children: "Driving License Expiry",
            }}
            errors={fields.driving_license_expiry.errors}
          />
          <SearchableSelectField
            inputProps={{
              ...getInputProps(fields.passport_number, {
                type: "text",
              }),
            }}
            className="lowercase"
            options={transformStringArrayIntoOptions(headerArray)}
            labelProps={{
              children: "Passport Number",
            }}
            errors={fields.passport_number.errors}
          />
          <SearchableSelectField
            className="capitalize"
            options={transformStringArrayIntoOptions(headerArray)}
            inputProps={{
              ...getInputProps(fields.passport_expiry, { type: "text" }),
            }}
            labelProps={{
              children: "Passport Expiry",
            }}
            errors={fields.passport_expiry.errors}
          />
        </div>
      </CardContent>
    </Card>
  );
}
