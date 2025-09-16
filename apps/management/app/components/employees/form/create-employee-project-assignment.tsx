import { Fragment } from "react";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import type { ComboboxSelectOption } from "@canny_ecosystem/ui/combobox";
import {
  assignmentTypeArray,
  getValidDateForInput,
  positionArray,
  replaceUnderscore,
  skillLevelArray,
  transformStringArrayIntoOptions,
  type EmployeeProjectAssignmentSchema,
} from "@canny_ecosystem/utils";
import { getInputProps, type FieldMetadata } from "@conform-to/react";
import {
  CheckboxField,
  Field,
  SearchableSelectField,
} from "@canny_ecosystem/ui/forms";

type FieldsType = {
  [K in keyof typeof EmployeeProjectAssignmentSchema.shape]: FieldMetadata<
    (typeof EmployeeProjectAssignmentSchema.shape)[K]["_type"],
    (typeof EmployeeProjectAssignmentSchema.shape)[K],
    string[]
  >;
};

export const SITE_PARAM = "site";

export const CreateEmployeeProjectAssignment = ({
  fields,
  isUpdate = false,
  siteOptions,
}: {
  fields: FieldsType;
  isUpdate?: boolean;
  siteOptions: ComboboxSelectOption[] | null | undefined;
}) => {
  return (
    <Fragment>
      <CardHeader>
        <CardTitle className="text-3xl capitalize">
          {isUpdate ? "Update" : "Add"} Employee Project Assignment
        </CardTitle>
        <CardDescription>
          {isUpdate ? "Update" : "Add"} project assignment of the employee
        </CardDescription>
      </CardHeader>
      <CardContent>
        <input {...getInputProps(fields.employee_id, { type: "hidden" })} />
        <SearchableSelectField
          className="capitalize"
          options={siteOptions ?? []}
          inputProps={{
            ...getInputProps(fields.site_id, { type: "text" }),
            defaultValue: fields.site_id.initialValue ?? undefined,
          }}
          placeholder={"Select Site"}
          labelProps={{
            children: "Site",
          }}
          errors={fields.site_id.errors}
        />
        <div className="grid grid-cols-3 max-sm:grid-cols-1 max-sm:gap-2 place-content-center justify-between gap-6">
          <SearchableSelectField
            className="capitalize"
            options={transformStringArrayIntoOptions(
              assignmentTypeArray as unknown as string[],
            )}
            inputProps={{
              ...getInputProps(fields.assignment_type, { type: "text" }),
            }}
            placeholder={`Select ${replaceUnderscore(
              fields.assignment_type.name,
            )}`}
            labelProps={{
              children: replaceUnderscore(fields.assignment_type.name),
            }}
            errors={fields.assignment_type.errors}
          />
          <SearchableSelectField
            className="capitalize"
            options={transformStringArrayIntoOptions(
              positionArray as unknown as string[],
            )}
            inputProps={{
              ...getInputProps(fields.position, { type: "text" }),
            }}
            placeholder={`Select ${fields.position.name}`}
            labelProps={{
              children: fields.position.name,
            }}
            errors={fields.position.errors}
          />
          <SearchableSelectField
            className="capitalize"
            options={transformStringArrayIntoOptions(
              skillLevelArray as unknown as string[],
            )}
            inputProps={{
              ...getInputProps(fields.skill_level, { type: "text" }),
            }}
            placeholder={`Select ${replaceUnderscore(fields.skill_level.name)}`}
            labelProps={{
              children: replaceUnderscore(fields.skill_level.name),
            }}
            errors={fields.skill_level.errors}
          />
        </div>
        <div className="grid grid-cols-2 max-sm:grid-cols-1 max-sm:gap-2 place-content-center justify-between gap-6">
          <Field
            inputProps={{
              ...getInputProps(fields.start_date, { type: "date" }),
              placeholder: `Enter ${replaceUnderscore(fields.start_date.name)}`,
              max: getValidDateForInput(new Date().toISOString()),
              defaultValue: getValidDateForInput(
                String(fields.start_date.initialValue),
              ),
            }}
            labelProps={{
              children: replaceUnderscore(fields.start_date.name),
            }}
            errors={fields.start_date.errors}
          />
          <Field
            inputProps={{
              ...getInputProps(fields.end_date, {
                type: "date",
              }),
              placeholder: `Enter ${replaceUnderscore(fields.end_date.name)}`,
              min: getValidDateForInput(String(fields.start_date.value)),
              defaultValue: getValidDateForInput(
                String(fields.end_date.initialValue),
              ),
            }}
            labelProps={{
              children: replaceUnderscore(fields.end_date.name),
            }}
            errors={fields.end_date.errors}
          />
        </div>
        <CheckboxField
          buttonProps={getInputProps(fields.probation_period, {
            type: "checkbox",
          })}
          labelProps={{
            htmlFor: fields.probation_period.id,
            children: "Is there a probation period?",
          }}
        />
        <Field
          inputProps={{
            ...getInputProps(fields.probation_end_date, {
              type: "date",
            }),
            placeholder: `Enter ${replaceUnderscore(
              fields.probation_end_date.name,
            )}`,
            defaultValue: getValidDateForInput(
              String(fields.probation_end_date.initialValue),
            ),
          }}
          labelProps={{
            children: replaceUnderscore(fields.probation_end_date.name),
          }}
          errors={fields.probation_end_date.errors}
        />
      </CardContent>
    </Fragment>
  );
};
