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
  deepEqualCheck,
  replaceUnderscore,
  UpdateUserContactSchema,
} from "@canny_ecosystem/utils";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";

import { Form } from "@remix-run/react";
type UserContactProps = {
  updateValues: {
    email: string | null;
    first_name: string;
    mobile_number: string | null;
  } | null;
};

export const UserContact = ({ updateValues }: UserContactProps) => {
  const [form, fields] = useForm({
    constraint: getZodConstraint(UpdateUserContactSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: UpdateUserContactSchema,
      });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: updateValues,
  });

  return (
    <FormProvider context={form.context}>
      <Card>
        <Form
          method="post"
          {...getFormProps(form)}
          action={"/user/update-user-contact"}
        >
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
            <CardDescription>
              Change your email address or mobile number.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid grid-cols-1 px-6 py-0 md:grid-cols-2 items-center justify-center md:gap-x-8">
            <Field
              inputProps={{
                ...getInputProps(fields.email, {
                  type: "text",
                }),
                placeholder: `Enter ${replaceUnderscore(fields.email.name)}`,
              }}
              errors={fields.email.errors}
            />

            <Field
              inputProps={{
                ...getInputProps(fields.mobile_number, {
                  type: "text",
                }),
                placeholder: `Enter ${replaceUnderscore(
                  fields.mobile_number.name
                )}`,
              }}
              errors={fields.mobile_number.errors}
            />
          </CardContent>
          <CardFooter className="border-t justify-between pt-6">
            <div>
              This is your primary email address and mobile number for
              notifications and more.
            </div>
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
        </Form>
      </Card>
    </FormProvider>
  );
};
