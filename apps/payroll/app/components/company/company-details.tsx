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
import { Field } from "@canny_ecosystem/ui/forms";
import {
  replaceUnderscore,
  zEmailSuffix,
  zNumberString,
} from "@canny_ecosystem/utils";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form } from "@remix-run/react";
import { z } from "zod";

export const COMPANY_DETAILS = "company-details";

export const CompanyDetailsSchema = z.object({
  id: z.string(),
  name: zNumberString.min(3),
  email_suffix: zEmailSuffix,
});

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
            <CardTitle>Company Name & Suffix</CardTitle>
            <CardDescription>
              This is your team's visible name and suffix within canny.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-8">
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
            </div>
          </CardContent>

          <CardFooter className="border-t pt-6 flex justify-between">
            <div>Please use 32 characters at maximum.</div>
            <Button
              form={form.id}
              disabled={!form.valid}
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
