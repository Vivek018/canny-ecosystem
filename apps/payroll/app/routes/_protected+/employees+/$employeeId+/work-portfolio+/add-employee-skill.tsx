import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Form, json, useLoaderData } from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import {
  EmployeeSkillsSchema,
  getInitialValueFromZod,
  isGoodStatus,
  proficiencyArray,
  replaceDash,
  replaceUnderscore,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { createEmployeeSkill } from "@canny_ecosystem/supabase/mutations";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import type { EmployeeSkillDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { useState } from "react";
import { UPDATE_EMPLOYEE_SKILL } from "./$skillId.update-employee-skill";
import { FormButtons } from "@/components/form/form-buttons";

export const ADD_EMPLOYEE_SKILL = "add-employee-skill";

export async function loader({ params }: LoaderFunctionArgs) {
  const employeeId = params.employeeId;

  return json({ employeeId });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const employeeId = params.employeeId;
  if (!employeeId) {
    return safeRedirect("/employees");
  }

  const submission = parseWithZod(formData, {
    schema: EmployeeSkillsSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { status, error } = await createEmployeeSkill({
    supabase,
    data: { ...submission.value, employee_id: employeeId },
  });

  if (isGoodStatus(status)) {
    return safeRedirect(`/employees/${employeeId}/work-portfolio`, {
      status: 303,
    });
  }
  return json({ status, error });
}

export default function AddEmployeeSkill({
  updateValues,
}: {
  updateValues?: EmployeeSkillDatabaseUpdate | null;
}) {
  const { employeeId } = useLoaderData<typeof loader>();
  const [resetKey, setResetKey] = useState(Date.now());

  const EMPLOYEE_SKILL_TAG = updateValues
    ? UPDATE_EMPLOYEE_SKILL
    : ADD_EMPLOYEE_SKILL;
  const currentSchema = EmployeeSkillsSchema;

  const initialValues = updateValues ?? getInitialValueFromZod(currentSchema);

  const [form, fields] = useForm({
    id: EMPLOYEE_SKILL_TAG,
    constraint: getZodConstraint(currentSchema),
    onValidate: ({ formData }: { formData: FormData }) => {
      return parseWithZod(formData, { schema: currentSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      employee_id: initialValues.employee_id ?? employeeId,
    },
  });

  return (
    <section className="md:px-20 lg:px-28 2xl:px-40 py-4">
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
                {replaceDash(EMPLOYEE_SKILL_TAG)}
              </CardTitle>
              <CardDescription>
                {EMPLOYEE_SKILL_TAG.split("-")[0]} skill of the employee
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input {...getInputProps(fields.id, { type: "hidden" })} />
              <input
                {...getInputProps(fields.employee_id, { type: "hidden" })}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.skill_name, { type: "text" }),
                  autoFocus: true,
                  placeholder: `Enter ${replaceUnderscore(
                    fields.skill_name.name,
                  )}`,
                  className: "capitalize",
                }}
                labelProps={{
                  children: replaceUnderscore(fields.skill_name.name),
                }}
                errors={fields.skill_name.errors}
              />
              <SearchableSelectField
                key={resetKey}
                className="capitalize"
                options={transformStringArrayIntoOptions(
                  proficiencyArray as unknown as string[],
                )}
                inputProps={{
                  ...getInputProps(fields.proficiency, { type: "text" }),
                }}
                placeholder={`Select ${fields.proficiency.name}`}
                labelProps={{
                  children: fields.proficiency.name,
                }}
                errors={fields.proficiency.errors}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.years_of_experience, {
                    type: "number",
                  }),
                  autoFocus: true,
                  placeholder: `Enter ${replaceUnderscore(
                    fields.years_of_experience.name,
                  )}`,
                  className: "capitalize",
                }}
                labelProps={{
                  children: replaceUnderscore(fields.years_of_experience.name),
                }}
                errors={fields.years_of_experience.errors}
              />
            </CardContent>
            <FormButtons
              form={form}
              setResetKey={setResetKey}
              isSingle={true}
            />
          </Card>
        </Form>
      </FormProvider>
    </section>
  );
}
