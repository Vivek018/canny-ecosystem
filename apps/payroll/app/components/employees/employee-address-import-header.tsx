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
  type ImportEmployeeAddressHeaderSchema,
} from "@canny_ecosystem/utils";
import { type FieldMetadata, getInputProps } from "@conform-to/react";
import { useEffect, useState } from "react";
import Papa from "papaparse";

type FieldsType = {
  [K in keyof typeof ImportEmployeeAddressHeaderSchema.shape]: FieldMetadata<
    (typeof ImportEmployeeAddressHeaderSchema.shape)[K]["_type"],
    (typeof ImportEmployeeAddressHeaderSchema.shape)[K],
    string[]
  >;
};

export function EmployeeAddressImportHeader({
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
              ...getInputProps(fields.address_type, {
                type: "text",
              }),
            }}
            className="lowercase"
            options={transformStringArrayIntoOptions(headerArray)}
            labelProps={{
              children: "Address Type",
            }}
            errors={fields.address_type.errors}
          />
          <SearchableSelectField
            inputProps={{
              ...getInputProps(fields.address_line_1, {
                type: "text",
              }),
            }}
            className="lowercase"
            options={transformStringArrayIntoOptions(headerArray)}
            labelProps={{
              children: "Address Line 1",
            }}
            errors={fields.address_line_1.errors}
          />
          <SearchableSelectField
            inputProps={{
              ...getInputProps(fields.address_line_2, {
                type: "text",
              }),
            }}
            className="lowercase"
            options={transformStringArrayIntoOptions(headerArray)}
            labelProps={{
              children: "Address Line 2",
            }}
            errors={fields.address_line_2.errors}
          />
          <SearchableSelectField
            inputProps={{
              ...getInputProps(fields.city, {
                type: "text",
              }),
            }}
            className="lowercase"
            options={transformStringArrayIntoOptions(headerArray)}
            labelProps={{
              children: "City",
            }}
            errors={fields.city.errors}
          />
          <SearchableSelectField
            className="capitalize"
            options={transformStringArrayIntoOptions(headerArray)}
            inputProps={{
              ...getInputProps(fields.pincode, { type: "text" }),
            }}
            labelProps={{
              children: "Pincode",
            }}
            errors={fields.pincode.errors}
          />
          <SearchableSelectField
            className="capitalize"
            options={transformStringArrayIntoOptions(headerArray)}
            inputProps={{
              ...getInputProps(fields.state, { type: "text" }),
            }}
            labelProps={{
              children: "State",
            }}
            errors={fields.state.errors}
          />
          <SearchableSelectField
            className="capitalize"
            options={transformStringArrayIntoOptions(headerArray)}
            inputProps={{
              ...getInputProps(fields.country, { type: "text" }),
            }}
            labelProps={{
              children: "Country",
            }}
            errors={fields.country.errors}
          />
          <SearchableSelectField
            inputProps={{
              ...getInputProps(fields.latitude, {
                type: "text",
              }),
            }}
            className="lowercase"
            options={transformStringArrayIntoOptions(headerArray)}
            labelProps={{
              children: "Latitude",
            }}
            errors={fields.latitude.errors}
          />
          <SearchableSelectField
            className="capitalize"
            options={transformStringArrayIntoOptions(headerArray)}
            inputProps={{
              ...getInputProps(fields.longitude, { type: "text" }),
            }}
            labelProps={{
              children: "Longitude",
            }}
            errors={fields.longitude.errors}
          />
          <SearchableSelectField
            className="capitalize"
            options={transformStringArrayIntoOptions(headerArray)}
            inputProps={{
              ...getInputProps(fields.is_primary, { type: "text" }),
            }}
            labelProps={{
              children: "Is Primary",
            }}
            errors={fields.is_primary.errors}
          />
        </div>
      </CardContent>
    </Card>
  );
}
