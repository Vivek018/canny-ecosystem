import { Fragment } from "react";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import {
  Combobox,
  type ComboboxSelectOption,
} from "@canny_ecosystem/ui/combobox";
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
import { Label } from "@canny_ecosystem/ui/label";
import { useSearchParams } from "@remix-run/react";
import {
  CheckboxField,
  Field,
  SearchableSelectField,
} from "@canny_ecosystem/ui/forms";

type FieldsType = {
  [K in keyof typeof EmployeeProjectAssignmentSchema.shape]: FieldMetadata<
    typeof EmployeeProjectAssignmentSchema,
    typeof EmployeeProjectAssignmentSchema,
    string[]
  >;
};

export const PROJECT_PARAM = "project";
export const PROJECT_SITE_PARAM = "project-site";

export const CreateEmployeeProjectAssignment = ({
  fields,
  isUpdate = false,
  projectOptions,
  projectSiteOptions,
  siteEmployeeOptions,
}: {
  fields: FieldsType;
  isUpdate?: boolean;
  projectOptions: ComboboxSelectOption[] | undefined;
  projectSiteOptions: ComboboxSelectOption[] | undefined;
  siteEmployeeOptions: ComboboxSelectOption[] | undefined;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <Fragment>
      <CardHeader>
        <CardTitle className='text-3xl'>
          {isUpdate ? "Update" : "Add"} Employee Project Assignment
        </CardTitle>
        <CardDescription>
          {isUpdate ? "Update" : "Add"} project assignment of the employee
        </CardDescription>
      </CardHeader>
      <CardContent>
        <input {...getInputProps(fields.employee_id, { type: "hidden" })} />
        <div className='grid grid-cols-3 place-content-center justify-between gap-6'>
          <div className='w-full flex flex-col gap-1.5'>
            <div className='flex'>
              <Label>Projects</Label>
              <sub className='text-primary'>*</sub>
            </div>
            <Combobox
              options={projectOptions ?? []}
              value={searchParams.get(PROJECT_PARAM) ?? ""}
              onChange={(project) => {
                if (project?.length) {
                  searchParams.set(PROJECT_PARAM, project);
                } else {
                  searchParams.delete(PROJECT_PARAM);
                }
                setSearchParams(searchParams);
              }}
              placeholder={"Select Projects"}
            />
          </div>
          <SearchableSelectField
            className='capitalize'
            options={projectSiteOptions ?? projectSiteOptions ?? []}
            inputProps={{
              ...getInputProps(fields.project_site_id, { type: "text" }),
              defaultValue:
                searchParams.get(PROJECT_SITE_PARAM) ??
                String(fields.project_site_id.initialValue),
            }}
            placeholder={"Select Project Site"}
            labelProps={{
              children: "Project Site",
            }}
            onChange={(projectSite) => {
              if (projectSite?.length) {
                searchParams.set(PROJECT_SITE_PARAM, projectSite);
              } else {
                searchParams.delete(PROJECT_SITE_PARAM);
              }
              setSearchParams(searchParams);
            }}
            errors={fields.project_site_id.errors}
          />
          <SearchableSelectField
            className='capitalize'
            options={siteEmployeeOptions ?? siteEmployeeOptions ?? []}
            inputProps={{
              ...getInputProps(fields.supervisor_id, { type: "text" }),
            }}
            placeholder={"Select Supervisor"}
            labelProps={{
              children: "Supervisor",
            }}
            errors={fields.supervisor_id.errors}
          />
        </div>
        <div className='grid grid-cols-3 place-content-center justify-between gap-6'>
          <SearchableSelectField
            className='capitalize'
            options={transformStringArrayIntoOptions(
              positionArray as unknown as string[]
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
            className='capitalize'
            options={transformStringArrayIntoOptions(
              skillLevelArray as unknown as string[]
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
          <SearchableSelectField
            className='capitalize'
            options={transformStringArrayIntoOptions(
              assignmentTypeArray as unknown as string[]
            )}
            inputProps={{
              ...getInputProps(fields.assignment_type, { type: "text" }),
            }}
            placeholder={`Select ${replaceUnderscore(
              fields.assignment_type.name
            )}`}
            labelProps={{
              children: replaceUnderscore(fields.assignment_type.name),
            }}
            errors={fields.assignment_type.errors}
          />
        </div>
        <div className='grid grid-cols-2 place-content-center justify-between gap-6'>
          <Field
            inputProps={{
              ...getInputProps(fields.start_date, { type: "date" }),
              placeholder: `Enter ${replaceUnderscore(fields.start_date.name)}`,
              max: getValidDateForInput(new Date().toISOString()),
              defaultValue: getValidDateForInput(
                String(fields.start_date.initialValue)
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
                String(fields.end_date.initialValue)
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
              fields.probation_end_date.name
            )}`,
            defaultValue: getValidDateForInput(
              String(fields.probation_end_date.initialValue)
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
