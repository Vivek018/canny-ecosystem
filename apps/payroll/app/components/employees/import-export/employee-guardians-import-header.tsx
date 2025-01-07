import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { SearchableSelectField } from "@canny_ecosystem/ui/forms";
import {
  type ImportEmployeeGuardiansHeaderSchemaObject,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import { type FieldMetadata, getInputProps } from "@conform-to/react";
import { useEffect, useState } from "react";
import Papa from "papaparse";

type FieldsType = {
  [K in keyof typeof ImportEmployeeGuardiansHeaderSchemaObject.shape]: FieldMetadata<
    (typeof ImportEmployeeGuardiansHeaderSchemaObject.shape)[K]["_type"],
    (typeof ImportEmployeeGuardiansHeaderSchemaObject.shape)[K],
    string[]
  >;
};

export function EmployeeGuardiansImportHeader({
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
              ...getInputProps(fields.relationship, {
                type: "text",
              }),
            }}
            className="lowercase"
            options={transformStringArrayIntoOptions(headerArray)}
            labelProps={{
              children: "Relation",
            }}
            errors={fields.relationship.errors}
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
              ...getInputProps(fields.date_of_birth, {
                type: "text",
              }),
            }}
            className="lowercase"
            options={transformStringArrayIntoOptions(headerArray)}
            labelProps={{
              children: "Date Of Birth",
            }}
            errors={fields.date_of_birth.errors}
          />
          <SearchableSelectField
            className="capitalize"
            options={transformStringArrayIntoOptions(headerArray)}
            inputProps={{
              ...getInputProps(fields.gender, { type: "text" }),
            }}
            labelProps={{
              children: "Gender",
            }}
            errors={fields.gender.errors}
          />
          <SearchableSelectField
            className="capitalize"
            options={transformStringArrayIntoOptions(headerArray)}
            inputProps={{
              ...getInputProps(fields.mobile_number, { type: "text" }),
            }}
            labelProps={{
              children: "Mobile Number",
            }}
            errors={fields.mobile_number.errors}
          />
          <SearchableSelectField
            className="capitalize"
            options={transformStringArrayIntoOptions(headerArray)}
            inputProps={{
              ...getInputProps(fields.alternate_mobile_number, {
                type: "text",
              }),
            }}
            labelProps={{
              children: "Alternate Mobile Number",
            }}
            errors={fields.alternate_mobile_number.errors}
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
              children: "Email",
            }}
            errors={fields.email.errors}
          />
          <SearchableSelectField
            className="capitalize"
            options={transformStringArrayIntoOptions(headerArray)}
            inputProps={{
              ...getInputProps(fields.is_emergency_contact, { type: "text" }),
            }}
            labelProps={{
              children: "Is Emergency Contact",
            }}
            errors={fields.is_emergency_contact.errors}
          />
          <SearchableSelectField
            className="capitalize"
            options={transformStringArrayIntoOptions(headerArray)}
            inputProps={{
              ...getInputProps(fields.address_same_as_employee, {
                type: "text",
              }),
            }}
            labelProps={{
              children: "Address same as Employee",
            }}
            errors={fields.address_same_as_employee.errors}
          />
        </div>
      </CardContent>
    </Card>
  );
}
