import type { CompanyDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { Button } from "@canny_ecosystem/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import {
  company_size,
  company_type,
  CompanyDetailsSchema,
  deepEqualCheck,
  replaceUnderscore,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form } from "@remix-run/react";

export const COMPANY_DETAILS = "company-details";

export const CompanyDetails = ({
  updateValues,
}: { updateValues: CompanyDatabaseUpdate }) => {
  const [form, fields] = useForm({
    id: COMPANY_DETAILS,
    constraint: getZodConstraint(CompanyDetailsSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: CompanyDetailsSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: updateValues,
  });

  return (
    <FormProvider context={form.context}>
      <Form
        method="POST"
        {...getFormProps(form)}
        action={`/${updateValues.id}/update-company`}
      >
        <Card>
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
            <CardDescription>
              This is your company's visible details within canny.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="grid grid-cols-1 md:grid-cols-2 items-center justify-center md:gap-x-8">
              <input
                type="hidden"
                name={fields.id.name}
                value={fields.id.value ?? fields.id.initialValue}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.name, { type: "text" }),
                  placeholder: `Enter ${fields.name.name}`,
                }}
                errors={fields.name.errors}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.email_suffix, { type: "text" }),
                  placeholder: `Enter ${replaceUnderscore(fields.email_suffix.name)}`,
                }}
                errors={fields.email_suffix.errors}
              />
              <SearchableSelectField
                className="w-full capitalize flex-1"
                options={transformStringArrayIntoOptions(
                  company_type as unknown as string[],
                )}
                inputProps={{
                  ...getInputProps(fields.company_type, { type: "text" }),
                }}
                placeholder={`Select ${replaceUnderscore(fields.company_type.name)}`}
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
                errors={fields.company_size.errors}
              />
            </div>
          </CardContent>

          <CardFooter className="border-t pt-6 flex justify-between">
            <div>Please use 32 characters at maximum.</div>
            <Button
              form={form.id}
              disabled={!form.valid || deepEqualCheck(form.initialValue, form.value)}
              variant="default"
              type="submit"
            >
              Save
            </Button>
          </CardFooter>
        </Card>
      </Form>
    </FormProvider>
  );
};
