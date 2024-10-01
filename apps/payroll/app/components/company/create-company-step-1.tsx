import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { Fragment } from "react";
import {
  company_size,
  company_type,
  replaceUnderscore,
  transformStringArrayIntoOptions,
  type CompanySchema,
} from "@canny_ecosystem/utils";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import { type FieldMetadata, getInputProps } from "@conform-to/react";

type FieldsType = {
  [K in keyof typeof CompanySchema.shape]: FieldMetadata<
    typeof CompanySchema,
    typeof CompanySchema,
    string[]
  >;
};

export function CreateCompanyStep1({
  fields,
}: {
  fields: FieldsType;
}) {
  return (
    <Fragment>
      <CardHeader>
        <CardTitle className="text-3xl">Create Company</CardTitle>
        <CardDescription>
          Create a company that will be central in all of canny apps
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Field
          inputProps={{
            ...getInputProps(fields.name, { type: "text" }),
            autoFocus: true,
            placeholder: `Enter ${fields.name.name}`,
          }}
          labelProps={{ children: fields.name.name }}
          errors={fields.name.errors}
        />
        <Field
          inputProps={{
            ...getInputProps(fields.logo, { type: "file" }),
            placeholder: `Enter ${fields.logo.name}`,
          }}
          labelProps={{ children: fields.logo.name }}
          errors={fields.logo.errors}
        />
        <Field
          inputProps={{
            ...getInputProps(fields.email_suffix, { type: "text" }),
            placeholder: `Enter ${replaceUnderscore(fields.email_suffix.name)}`,
          }}
          labelProps={{
            children: replaceUnderscore(fields.email_suffix.name),
          }}
          errors={fields.email_suffix.errors}
        />
        <div className="grid grid-cols-2 grid-rows-1 place-content-center justify-between gap-16">
          <SearchableSelectField
            className="w-full capitalize flex-1"
            options={transformStringArrayIntoOptions(
              company_type as unknown as string[],
            )}
            inputProps={{
              ...getInputProps(fields.company_type, { type: "text" }),
            }}
            placeholder={`Select ${replaceUnderscore(fields.company_type.name)}`}
            labelProps={{
              children: replaceUnderscore(fields.company_type.name),
            }}
            errors={fields.company_type.errors}
          />
          <SearchableSelectField
            className="w-full capitalize flex-1"
            options={transformStringArrayIntoOptions(
              company_size as unknown as string[],
            )}
            inputProps={{
              ...getInputProps(fields.company_size, { type: "text" }),
            }}
            placeholder={`Select ${replaceUnderscore(fields.company_size.name)}`}
            labelProps={{
              children: replaceUnderscore(fields.company_size.name),
            }}
            errors={fields.company_size.errors}
          />
        </div>
      </CardContent>
    </Fragment>
  );
}
