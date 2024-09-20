import {
  replaceUnderscore,
  zNumber,
  zString,
  zTextArea,
} from "@canny_ecosystem/utils";
import {
  Field,
  SearchableSelectField,
  TextareaField,
} from "@canny_ecosystem/ui/forms";
import { Label } from "@canny_ecosystem/ui/label";
import { getInitialValueFromZod, replaceDash } from "@canny_ecosystem/utils";
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
import { statesAndUTs } from "@canny_ecosystem/utils/constant";
import { Button } from "@canny_ecosystem/ui/button";

export const CREATE_LOCATION = "create-location";

const LocationSchema = z.object({
  id: z.string().optional(),
  city: zString.min(3),
  state: zString,
  esic_code: zNumber.min(10).max(17),
  address: zTextArea,
});

export default function CreateLocation() {
  const initialValues = getInitialValueFromZod(LocationSchema);

  const [form, fields] = useForm({
    id: CREATE_LOCATION,
    constraint: getZodConstraint(LocationSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: LocationSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: initialValues,
  });

  return (
    <div className="px-60 py-12">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Label className="text-3xl mb-10">
            {replaceDash(CREATE_LOCATION)}
          </Label>
          <div className="grid grid-cols-2 grid-rows-1 place-items-center justify-between gap-16">
            <Field
              inputProps={{
                ...getInputProps(fields.city, { type: "text" }),
                autoFocus: true,
                placeholder: `Enter ${fields.city.name}`,
              }}
              labelProps={{ children: fields.city.name }}
              errors={fields.city.errors}
              />
            <SearchableSelectField
              className="w-full flex-1"
              options={statesAndUTs}
              inputProps={{
                ...getInputProps(fields.state, { type: "text" }),
              }}
              placeholder={`Enter ${fields.state.name}`}
              labelProps={{ children: fields.state.name }}
              errors={fields.state.errors}
            />
          </div>
          <div className="flex justify-between gap-16">
            <Field
              inputProps={{
                ...getInputProps(fields.esic_code, { type: "number" }),
                placeholder: `Enter ${replaceUnderscore(fields.esic_code.name)}`,
              }}
              labelProps={{
                children: replaceUnderscore(fields.esic_code.name),
              }}
              errors={fields.esic_code.errors}
            />
          </div>
          <TextareaField
            textareaProps={{
              ...getTextareaProps(fields.address),
              placeholder: `Enter ${replaceUnderscore(fields.address.name)}`,
            }}
            labelProps={{
              children: replaceUnderscore(fields.address.name),
            }}
            errors={fields.address.errors}
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
