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
  UpdateUserNameSchema,
} from "@canny_ecosystem/utils";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";

import { Form } from "@remix-run/react";

type UserNameProps = {
  updateValues: {
    first_name: string;
    last_name: string;
  } | null;
};

export const UserName = ({ updateValues }: UserNameProps) => {
  const [form, fields] = useForm({
    constraint: getZodConstraint(UpdateUserNameSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: UpdateUserNameSchema });
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
        action={"/user/update-user-name"}
      >
        <Card>
          <CardHeader>
            <CardTitle>Display Name</CardTitle>
            <CardDescription>
              Please enter your first name and last name.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 px-6 py-0 md:grid-cols-2 items-center justify-center md:gap-x-8">
            <Field
              inputProps={{
                ...getInputProps(fields.first_name, {
                  type: "text",
                }),
                placeholder: `Enter ${replaceUnderscore(
                  fields.first_name.name
                )}`,
              }}
              errors={fields.first_name.errors}
            />
            <Field
              inputProps={{
                ...getInputProps(fields.last_name, {
                  type: "text",
                }),
                placeholder: `Enter ${replaceUnderscore(
                  fields.last_name.name
                )}`,
              }}
              errors={fields.last_name.errors}
            />
          </CardContent>
          <CardFooter className="border-t justify-between pt-6">
            <div>Please use 20 characters at maximum.</div>
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
