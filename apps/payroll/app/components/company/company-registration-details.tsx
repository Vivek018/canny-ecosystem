import { useUserRole } from "@/utils/user";
import type { CompanyRegistrationDetailsUpdate } from "@canny_ecosystem/supabase/types";
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
import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  CompanyRegistrationDetailsSchema,
  deepEqualCheck,
  hasPermission,
  replaceUnderscore,
  updateRole,
} from "@canny_ecosystem/utils";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form } from "@remix-run/react";

export const COMPANY_REGISTRATION_DETAILS = "company-registration-details";

export const CompanyRegistrationDetails = ({
  updateValues,
}: {
  updateValues: Omit<
    CompanyRegistrationDetailsUpdate,
    "created_at" | "updated_at"
  >;
}) => {
  const { role } = useUserRole();
  const [form, fields] = useForm({
    id: COMPANY_REGISTRATION_DETAILS,
    constraint: getZodConstraint(CompanyRegistrationDetailsSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: CompanyRegistrationDetailsSchema,
      });
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
        action={`/${updateValues?.company_id}/update-company-registration-details`}
      >
        <Card>
          <CardHeader>
            <CardTitle>Company Registration Details</CardTitle>
            <CardDescription>
              This is your company's registration details within canny.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="grid grid-cols-1 md:grid-cols-2 items-center justify-center md:gap-x-8">
              <input
                {...getInputProps(fields.company_id, { type: "hidden" })}
              />
              <Field
                className="md:col-span-2"
                inputProps={{
                  ...getInputProps(fields.registration_number, {
                    type: "text",
                  }),
                  placeholder: `Enter ${replaceUnderscore(
                    fields.registration_number.name
                  )}`,
                  readOnly: !hasPermission(
                    role,
                    `${updateRole}:setting_general`
                  ),
                }}
                errors={fields.registration_number.errors}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.gst_number, { type: "text" }),
                  placeholder: `Enter ${replaceUnderscore(
                    fields.gst_number.name
                  )}`,
                  readOnly: !hasPermission(
                    role,
                    `${updateRole}:setting_general`
                  ),
                }}
                errors={fields.gst_number.errors}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.pan_number, { type: "text" }),
                  placeholder: `Enter ${replaceUnderscore(
                    fields.pan_number.name
                  )}`,
                  readOnly: !hasPermission(
                    role,
                    `${updateRole}:setting_general`
                  ),
                }}
                errors={fields.pan_number.errors}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.pf_number, { type: "text" }),
                  placeholder: `Enter ${replaceUnderscore(
                    fields.pf_number.name
                  )}`,
                  readOnly: !hasPermission(
                    role,
                    `${updateRole}:setting_general`
                  ),
                }}
                errors={fields.pf_number.errors}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.esic_number, { type: "text" }),
                  placeholder: `Enter ${replaceUnderscore(
                    fields.esic_number.name
                  )}`,
                  readOnly: !hasPermission(
                    role,
                    `${updateRole}:setting_general`
                  ),
                }}
                errors={fields.esic_number.errors}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.lwf_number, { type: "text" }),
                  placeholder: `Enter ${replaceUnderscore(
                    fields.lwf_number.name
                  )}`,
                  readOnly: !hasPermission(
                    role,
                    `${updateRole}:setting_general`
                  ),
                }}
                errors={fields.lwf_number.errors}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.pt_number, { type: "text" }),
                  placeholder: `Enter ${replaceUnderscore(
                    fields.pt_number.name
                  )}`,
                  readOnly: !hasPermission(
                    role,
                    `${updateRole}:setting_general`
                  ),
                }}
                errors={fields.pt_number.errors}
              />
            </div>
          </CardContent>

          <CardFooter
            className={cn(
              "border-t pt-6 flex justify-between",
              !hasPermission(role, `${updateRole}:setting_general`) && "hidden"
            )}
          >
            <div>Please use 15 characters at maximum.</div>
            <div className="flex gap-4">
              <Button
                variant="secondary"
                type="reset"
                {...form.reset.getButtonProps()}
              >
                Reset
              </Button>
              <Button
                form={form.id}
                disabled={
                  !form.valid || deepEqualCheck(form.initialValue, form.value)
                }
                variant="default"
                type="submit"
              >
                Save
              </Button>
            </div>
          </CardFooter>
        </Card>
      </Form>
    </FormProvider>
  );
};
