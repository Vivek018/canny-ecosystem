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
  type ImportEmployeeHeaderSchema,
} from "@canny_ecosystem/utils";
import { type FieldMetadata, getInputProps } from "@conform-to/react";
import { useEffect, useState } from "react";
import Papa from "papaparse";

type FieldsType = {
  [K in keyof typeof ImportEmployeeHeaderSchema.shape]: FieldMetadata<
    (typeof ImportEmployeeHeaderSchema.shape)[K]["_type"],
    (typeof ImportEmployeeHeaderSchema.shape)[K],
    string[]
  >;
};

export function EmployeeImportHeader({
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
              ...getInputProps(fields.first_name, {
                type: "text",
              }),
            }}
            className="lowercase"
            options={transformStringArrayIntoOptions(headerArray)}
            labelProps={{
              children: "First Name",
            }}
            errors={fields.first_name.errors}
          />
          <SearchableSelectField
            inputProps={{
              ...getInputProps(fields.middle_name, {
                type: "text",
              }),
            }}
            className="lowercase"
            options={transformStringArrayIntoOptions(headerArray)}
            labelProps={{
              children: "Middle Name",
            }}
            errors={fields.middle_name.errors}
          />
          <SearchableSelectField
            inputProps={{
              ...getInputProps(fields.last_name, {
                type: "text",
              }),
            }}
            className="lowercase"
            options={transformStringArrayIntoOptions(headerArray)}
            labelProps={{
              children: "Last Name",
            }}
            errors={fields.last_name.errors}
          />
          <SearchableSelectField
            inputProps={{
              ...getInputProps(fields.gender, {
                type: "text",
              }),
            }}
            className="lowercase"
            options={transformStringArrayIntoOptions(headerArray)}
            labelProps={{
              children: "Gender",
            }}
            errors={fields.gender.errors}
          />
          <SearchableSelectField
            className="capitalize"
            options={transformStringArrayIntoOptions(headerArray)}
            inputProps={{
              ...getInputProps(fields.marital_status, { type: "text" }),
            }}
            labelProps={{
              children: "Marital Status",
            }}
            errors={fields.marital_status.errors}
          />
          <SearchableSelectField
            className="capitalize"
            options={transformStringArrayIntoOptions(headerArray)}
            inputProps={{
              ...getInputProps(fields.date_of_birth, { type: "text" }),
            }}
            labelProps={{
              children: "Date of Birth",
            }}
            errors={fields.date_of_birth.errors}
          />
          <SearchableSelectField
            className="capitalize"
            options={transformStringArrayIntoOptions(headerArray)}
            inputProps={{
              ...getInputProps(fields.education, { type: "text" }),
            }}
            labelProps={{
              children: "Education",
            }}
            errors={fields.education.errors}
          />
          <SearchableSelectField
            inputProps={{
              ...getInputProps(fields.is_active, {
                type: "text",
              }),
            }}
            className="lowercase"
            options={transformStringArrayIntoOptions(headerArray)}
            labelProps={{
              children: "Is Active",
            }}
            errors={fields.is_active.errors}
          />
          <SearchableSelectField
            className="capitalize"
            options={transformStringArrayIntoOptions(headerArray)}
            inputProps={{
              ...getInputProps(fields.personal_email, { type: "text" }),
            }}
            labelProps={{
              children: "Personal Email",
            }}
            errors={fields.personal_email.errors}
          />
          <SearchableSelectField
            className="capitalize"
            options={transformStringArrayIntoOptions(headerArray)}
            inputProps={{
              ...getInputProps(fields.primary_mobile_number, { type: "text" }),
            }}
            labelProps={{
              children: "Primary Mobile Number",
            }}
            errors={fields.primary_mobile_number.errors}
          />
          <SearchableSelectField
            className="capitalize"
            options={transformStringArrayIntoOptions(headerArray)}
            inputProps={{
              ...getInputProps(fields.secondary_mobile_number, { type: "text" }),
            }}
            labelProps={{
              children: "Secondary Mobile Number",
            }}
            errors={fields.secondary_mobile_number.errors}
          />
        </div>
      </CardContent>
    </Card>
  );
}
