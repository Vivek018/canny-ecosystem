import { CompanySchema, isGoodStatus, SIZE_1MB } from "@canny_ecosystem/utils";
import { createCompany } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Button } from "@canny_ecosystem/ui/button";
import { Field } from "@canny_ecosystem/ui/forms";
import {
  getInitialValueFromZod,
  replaceDash,
  replaceUnderscore,
} from "@canny_ecosystem/utils";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import {
  json,
  unstable_parseMultipartFormData as parseMultipartFormData,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
} from "@remix-run/node";
import { safeRedirect } from "@/utils/server/http.server";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { setCompanyId } from "@/utils/server/company.server";

export const CREATE_COMPANY = "create-company";

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await parseMultipartFormData(
    request,
    createMemoryUploadHandler({ maxPartSize: SIZE_1MB }),
  );

  const submission = parseWithZod(formData, {
    schema: CompanySchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { status, error, id } = await createCompany({
    supabase,
    data: submission.value,
  });

  if (isGoodStatus(status)) {
    const headers = new Headers();
    headers.append("Set-Cookie", setCompanyId(id));
    return safeRedirect("/", { headers });
  }
  return json({ status, error });
}

export default function CreateCompany() {
  const initialValues = getInitialValueFromZod(CompanySchema);

  const [form, fields] = useForm({
    id: CREATE_COMPANY,
    constraint: getZodConstraint(CompanySchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: CompanySchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: initialValues,
  });

  return (
    <section className="md:px-20 lg:px-52 2xl:px-80 py-6">
      <FormProvider context={form.context}>
        <Form
          method="POST"
          encType="multipart/form-data"
          {...getFormProps(form)}
          className="flex flex-col"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">
                {replaceDash(CREATE_COMPANY)}
              </CardTitle>
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
                    children: replaceUnderscore(
                      fields.reimbursement_charge.name,
                    ),
                  }}
                  errors={fields.reimbursement_charge.errors}
                />
              </div>
            </CardContent>
            <CardFooter>
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
            </CardFooter>
          </Card>
        </Form>
      </FormProvider>
    </section>
  );
}
