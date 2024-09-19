import {
  CREATE_COMPANY,
  zEmailSuffix,
  zImage,
  zNumberString,
  zTextArea,
} from "@/constant";
import { Button } from "@canny_ecosystem/ui/button";
import { Field, TextareaField } from "@canny_ecosystem/ui/forms";
import { Label } from "@canny_ecosystem/ui/label";
import { replaceDash, replaceUnderscore } from "@canny_ecosystem/utils";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form } from "@remix-run/react";
import { z } from "zod";

const CompanySchema = z.object({
  id: z.string().optional(),
  name: zNumberString.min(4),
  logo: zImage,
  email_suffix: zEmailSuffix,
  service_charge: z.number().min(2).max(20),
  reimbursement_charge: z.number().min(0.1).max(20).optional(),
  main_address: zTextArea,
});

export default function CreateCompany() {
  const [form, fields] = useForm({
    id: CREATE_COMPANY,
    constraint: getZodConstraint(CompanySchema),
    // lastResult: actionData?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: CompanySchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
  });

  return (
    <div className="px-60 py-12">
      <FormProvider context={form.context}>
        <Form
          method="POST"
          encType="multipart/form-data"
          {...getFormProps(form)}
          className="flex flex-col"
        >
          <Label className="text-3xl mb-10">
            {replaceDash(CREATE_COMPANY)}
          </Label>
          <Field
            inputProps={{
              ...getInputProps(fields.name, { type: "text" }),
              autoFocus: true,
              placeholder: `Enter ${fields.name.name}`,
            }}
            labelProps={{ children: fields.name.name }}
            errors={fields.name.errors}
          />
          <div className="flex justify-between gap-16">
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
          </div>
          <div className="flex justify-between gap-16">
            <Field
              inputProps={{
                ...getInputProps(fields.service_charge, { type: "number" }),
                placeholder: `Enter ${replaceUnderscore(fields.service_charge.name)}`,
              }}
              labelProps={{
                children: replaceUnderscore(fields.service_charge.name),
              }}
              errors={fields.service_charge.errors}
            />
            <Field
              inputProps={{
                ...getInputProps(fields.reimbursement_charge, {
                  type: "number",
                }),
                placeholder: `Enter ${replaceUnderscore(fields.reimbursement_charge.name)}`,
              }}
              labelProps={{
                children: replaceUnderscore(fields.reimbursement_charge.name),
              }}
              errors={fields.reimbursement_charge.errors}
            />
          </div>
          <TextareaField
            textareaProps={{
              ...getTextareaProps(fields.main_address),
              placeholder: `Enter ${replaceUnderscore(fields.main_address.name)}`,
            }}
            labelProps={{
              children: replaceUnderscore(fields.main_address.name),
            }}
            errors={fields.main_address.errors}
          />
          <div className="ml-auto w-2/5 flex flex-row items-center justify-center gap-4">
            <Button
              variant="secondary"
              size="full"
              type="reset"
              {...form.reset.getButtonProps()}
            >
              Reset
            </Button>
            <Button
              form={form.id}
              disabled={!form.valid}
              variant="default"
              size="full"
              type="submit"
            >
              Submit
            </Button>
          </div>
        </Form>
      </FormProvider>
    </div>
  );
}
