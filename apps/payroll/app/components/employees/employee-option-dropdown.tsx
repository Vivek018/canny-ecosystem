import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Form, redirect, useSubmit } from "@remix-run/react";
import { DeleteEmployee } from "./delete-employee";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@canny_ecosystem/ui/dialog";
import { Button } from "@canny_ecosystem/ui/button";
import { useState } from "react";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import { FormProvider, getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { eligibilityOptionsArray, getInitialValueFromZod, getValidDateForInput, PaymentTemplateFormDialogSchema, replaceUnderscore, transformStringArrayIntoOptions, z } from "@canny_ecosystem/utils";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import { getPaymentTemplateAssignmentByEmployeeId, getPaymentTemplatesByCompanyId } from "@canny_ecosystem/supabase/queries";
import type { SupabaseEnv } from "@canny_ecosystem/supabase/types";
import { Spinner } from "@canny_ecosystem/ui/spinner";

type initialValuesType = {
  effective_from: string;
  effective_to: string | null;
  template_id: string;
  eligibility_option: "position" | "skill_level" | null;
}

type paymentTemplateIptionsType = {
  label: string;
  value: string;
}

export const EmployeeOptionsDropdown = ({ employee, triggerChild, env }: {
  employee: {
    id: string;
    is_active: boolean;
    returnTo?: string;
    employee_project_assignment: { [x: string]: any; },
    companyId: string
  };
  triggerChild: React.ReactElement;
  env: SupabaseEnv
}) => {
  const { supabase } = useSupabase({ env });
  const [paymentTemplatesOptions, setPaymentTemplatesOptions] = useState<paymentTemplateIptionsType[]>([]);
  const [initialValues, setInitialValues] = useState<initialValuesType | null>(null);
  const [showSpinner, setShowSpinner] = useState(true);
  const [resetKey, _setResetKey] = useState(Date.now());
  const submit = useSubmit();

  const [form, fields] = useForm({
    id: "payment-template-form",
    constraint: getZodConstraint(PaymentTemplateFormDialogSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: PaymentTemplateFormDialogSchema });
    },
    defaultValue: initialValues ?? getInitialValueFromZod(PaymentTemplateFormDialogSchema),
    shouldValidate: 'onInput',
    shouldRevalidate: 'onInput'
  });

  async function setLinkedDataIfExists() {
    const { data } = await getPaymentTemplateAssignmentByEmployeeId({
      supabase,
      employee_id: employee.id,
    });
    setShowSpinner(false);
    if (data) {
      const values = {
        effective_from: data.effective_from,
        effective_to: data.effective_to,
        template_id: data.template_id,
        eligibility_option: data.eligibility_option,
      };
      setInitialValues(values);
      form.update({ value: values });
    }
  }

  const handleMarkAsActive = () => {
    submit(
      {
        id: employee.id,
        is_active: true,
        returnTo: employee.returnTo ?? "/employees",
      },
      {
        method: "POST",
        action: `/employees/${employee.id}/update-active`,
      },
    );
  };

  const handleMarkAsInactive = () => {
    submit(
      {
        id: employee.id,
        is_active: false,
        returnTo: employee.returnTo ?? "/employees",
      },
      {
        method: "POST",
        action: `/employees/${employee.id}/update-active`,
      },
    );
  };

  const openPaymentTemplateDialog = async () => {
    setLinkedDataIfExists();
    const { data } = await getPaymentTemplatesByCompanyId({ supabase, company_id: employee.companyId });
    if (data) {
      const newPaymentTemplatesOptions = data?.map((paymentTemplate) => (
        { label: paymentTemplate.name, value: paymentTemplate.id }
      ));
      setPaymentTemplatesOptions(newPaymentTemplatesOptions);
    }
  }

  const createOrEditEmployeeLink = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validation = parseWithZod(new FormData(e.currentTarget.form), { schema: PaymentTemplateFormDialogSchema });
    if (validation.status !== 'success') return redirect("/employees");
    submit(
      {
        effective_from: fields.effective_from?.value || "",
        effective_to: fields.effective_to?.value || "",
        template_id: fields.template_id?.value || "",
        eligibility_option: fields.eligibility_option?.value || "",
        [fields.eligibility_option.value || ""]: employee.employee_project_assignment[fields.eligibility_option.value || '']
      },
      {
        method: "POST",
        action: `/templates/${employee.id}/${initialValues ? "update" : "create"}-employee-link`,
      },
    );
  }

  const deleteEmployeeLink = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    submit(
      {
        is_active: false,
        returnTo: employee.returnTo ?? "/employees",
      },
      {
        method: "POST",
        action: `/templates/${employee.id}/delete-employee-link`,
      },
    );
  }

  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            className={cn(employee.is_active && "hidden")}
            onClick={handleMarkAsActive}
          >
            Make as Active
          </DropdownMenuItem>
          <DropdownMenuItem
            className={cn(!employee.is_active && "hidden")}
            onClick={handleMarkAsInactive}
          >
            Make as Inactive
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="item-start justify-start px-2 font-normal w-full"
                onClick={openPaymentTemplateDialog}
              >
                Link template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogTitle className="text-xl font-semibold mb-4">Link Payment Template</DialogTitle>
              <FormProvider context={form.context}>
                <Form method="POST" {...getFormProps(form)} className="space-y-6 w-full">
                  <div className="grid grid-cols-2 gap-4">
                    <Field
                      className="w-full"
                      inputProps={{
                        ...getInputProps(fields.effective_from, { type: "date" }),
                        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none",
                        placeholder: replaceUnderscore(fields.effective_from.name),
                        max: getValidDateForInput(new Date().toISOString()),
                        defaultValue: getValidDateForInput(fields.effective_from.initialValue),
                      }}
                      labelProps={{
                        children: replaceUnderscore(fields.effective_from.name),
                        className: "block text-sm font-medium text-gray-700 mb-1"
                      }}
                      errors={fields.effective_from.errors}
                    />
                    <Field
                      className="w-full"
                      inputProps={{
                        ...getInputProps(fields.effective_to, { type: "date" }),
                        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none",
                        placeholder: replaceUnderscore(fields.effective_to.name),
                        min: getValidDateForInput(fields.effective_from.value),
                        defaultValue: getValidDateForInput(
                          fields.effective_to.initialValue,
                        ),
                      }}
                      labelProps={{
                        children: replaceUnderscore(fields.effective_to.name),
                        className: "block text-sm font-medium text-gray-700 mb-1"
                      }}
                      errors={fields.effective_to.errors}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <SearchableSelectField
                      key={resetKey}
                      className="capitalize"
                      options={paymentTemplatesOptions}
                      inputProps={{
                        ...getInputProps(fields.template_id, { type: "text" }),
                      }}
                      placeholder={`Select ${fields.template_id.name}`}
                      labelProps={{
                        children: replaceUnderscore(fields.template_id.name),
                      }}
                      errors={fields.template_id.errors}
                    />
                    <SearchableSelectField
                      key={resetKey + 1}
                      className="capitalize"
                      options={transformStringArrayIntoOptions(eligibilityOptionsArray as unknown as string[])}
                      inputProps={{
                        ...getInputProps(fields.eligibility_option, { type: "text" }),
                      }}
                      placeholder={`Select ${fields.eligibility_option.name}`}
                      labelProps={{
                        children: replaceUnderscore(fields.eligibility_option.name),
                      }}
                      errors={fields.eligibility_option.errors}
                    />
                  </div>
                  {
                    showSpinner ? <div className="flex justify-center"><Spinner /></div> : <>
                      <Button onClick={(e) => createOrEditEmployeeLink(e as any)} variant="default" className="w-full">
                        {initialValues ? "Update" : "Link"} Template
                      </Button>
                      <Button
                        variant="destructive-ghost"
                        className={`w-full ${!initialValues && "hidden"}`}
                        onClick={(e) => deleteEmployeeLink(e)}
                      >
                        Delete link
                      </Button>
                    </>
                  }
                </Form>
              </FormProvider>
            </DialogContent>
          </Dialog>
          <DropdownMenuSeparator />
          <DeleteEmployee employeeId={employee.id} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};