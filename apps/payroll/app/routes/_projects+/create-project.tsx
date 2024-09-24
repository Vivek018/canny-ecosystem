import {
  getValidDateForInput,
  isGoodStatus,
  ProjectSchema,
  SIZE_1MB,
} from "@canny_ecosystem/utils";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Button } from "@canny_ecosystem/ui/button";
import { Field, TextareaField } from "@canny_ecosystem/ui/forms";
import {
  getInitialValueFromZod,
  replaceDash,
  replaceUnderscore,
} from "@canny_ecosystem/utils";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
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
import { createProject } from "@canny_ecosystem/supabase/mutations";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";

export const CREATE_PROJECT = "create-project";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  return json({ companyId: companyId });
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await parseMultipartFormData(
    request,
    createMemoryUploadHandler({ maxPartSize: SIZE_1MB }),
  );

  const submission = parseWithZod(formData, {
    schema: ProjectSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { status, error } = await createProject({
    supabase,
    data: submission.value,
  });

  if (isGoodStatus(status)) {
    return safeRedirect("/projects");
  }
  return json({ status, error });
}

export default function CreateProject() {
  const { companyId } = useLoaderData<typeof loader>();
  const initialValues = getInitialValueFromZod(ProjectSchema);

  const [form, fields] = useForm({
    id: CREATE_PROJECT,
    constraint: getZodConstraint(ProjectSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ProjectSchema });
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
                {replaceDash(CREATE_PROJECT)}
              </CardTitle>
              <CardDescription>
                Create a new company that will be central in all of canny apps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                type="hidden"
                name={fields.company_id.name}
                value={companyId}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.name, { type: "text" }),
                  autoFocus: true,
                  placeholder: `Enter ${fields.name.name}`,
                }}
                labelProps={{ children: fields.name.name }}
                errors={fields.name.errors}
              />
              <TextareaField
                textareaProps={{
                  ...getTextareaProps(fields.description),
                  placeholder: `Enter ${fields.description.name}`,
                }}
                labelProps={{ children: fields.description.name }}
                errors={fields.description.errors}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.image, { type: "file" }),
                  placeholder: `Enter ${fields.image.name}`,
                }}
                labelProps={{
                  children: fields.image.name,
                }}
                errors={fields.image.errors}
              />
              <div className="grid grid-cols-2 grid-rows-1 place-content-center justify-between gap-16">
                <Field
                  inputProps={{
                    ...getInputProps(fields.starting_date, { type: "date" }),
                    placeholder: `Enter ${replaceUnderscore(fields.starting_date.name)}`,
                    max: getValidDateForInput(new Date().toISOString()),
                    defaultValue: getValidDateForInput(
                      fields.starting_date.initialValue,
                    ),
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.starting_date.name),
                  }}
                  errors={fields.starting_date.errors}
                />
                <Field
                  inputProps={{
                    ...getInputProps(fields.ending_date, { type: "date" }),
                    placeholder: `Enter ${replaceUnderscore(fields.ending_date.name)}`,
                    min: getValidDateForInput(fields.starting_date.value),
                    defaultValue: getValidDateForInput(
                      fields.ending_date.initialValue,
                    ),
                  }}
                  labelProps={{
                    children: replaceUnderscore(fields.ending_date.name),
                  }}
                  errors={fields.ending_date.errors}
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
