import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import { DeleteEmployee } from "./delete-employee";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@canny_ecosystem/ui/dialog";
import { Button } from "@canny_ecosystem/ui/button";
import { useState } from "react";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import { FormProvider, getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { eligibilityOptionsArray, getInitialValueFromZod, getValidDateForInput, replaceUnderscore, z } from "@canny_ecosystem/utils";

export const EmployeeOptionsDropdown = ({ employee, triggerChild }: {
  employee: {
    id: string;
    is_active: boolean;
    returnTo?: string;
  };
  triggerChild: React.ReactElement;
}) => {
  const loaderData = useLoaderData<any>();
  const submit = useSubmit();

  const [paymentTemplatesOptions, setPaymentTemplatesOptions] = useState<any>([]);
  const employee_project_assignment = []; //loaderData?.data.find(e => e.id === employee.id).employee_project_assignment;
  const eligibilityOptions = eligibilityOptionsArray.map((eligibilityOption) => {
    return { label: eligibilityOption, value: eligibilityOption }
  });

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

  const showPaymentTemplates = () => {
    // fetch from DB..
    const dummyPaymentTemplatesOptions = [{
      id: "c1af93e4-39f9-4a3c-a12d-26bdb25bccca",
      name: "test payment template",
    }];
    const newPaymentTemplatesOptions = dummyPaymentTemplatesOptions
      .map((paymentTemplate) => ({ label: paymentTemplate.name, value: paymentTemplate.id }));
    setPaymentTemplatesOptions(newPaymentTemplatesOptions);
  }

  const createEmployeeLink = (e) => {
    e.preventDefault();
    submit(
      {
        employee_id: employee.id,
        is_active: false,
        returnTo: employee.returnTo ?? "/employees",
        assignment_type: "employee",
        effective_from: fields.effective_from.value,
        effective_to: fields.effective_to.value,
        template_id: fields.payment_template.value,
        eligibility_option: fields.eligibility_option.value,
        [fields.eligibility_option.value] : employee_project_assignment[fields.eligibility_option.value]
      },
      {
        method: "POST",
        action: "/templates/create-employee-link",
      },
    );
  }

  const deleteEmployeeLink = () => {
    submit(
      {
        employee_id: employee.id,
        is_active: false,
        returnTo: employee.returnTo ?? "/employees",
      },
      {
        method: "POST",
        action: "/templates/delete-employee-link",
      },
    );
  }


  const paymentTemplateFormDialogSchema = z.object({
    effective_from: z.string().default(new Date().toISOString().split("T")[0]),
    effective_to: z.string().optional(),
    payment_template: z.string(),
    eligibility_option: z.string(),
  });

  const [form, fields] = useForm({
    id: "payment-template-form",
    constraint: getZodConstraint(paymentTemplateFormDialogSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: paymentTemplateFormDialogSchema });
    },
    defaultValue: getInitialValueFromZod(paymentTemplateFormDialogSchema),
    shouldValidate: 'onInput'
  });

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
                onClick={showPaymentTemplates}
              >
                Link template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogTitle className="text-xl font-semibold mb-4">Link Payment Template</DialogTitle>
              <FormProvider context={form.context}>
                <Form
                  method="POST"
                  {...getFormProps(form)}
                  className="space-y-6 w-full"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <Field
                      className="w-full"
                      inputProps={{
                        ...getInputProps(fields.effective_from, { type: "date" }),
                        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none",
                        placeholder: replaceUnderscore(fields.effective_from.name),
                        max: getValidDateForInput(new Date().toISOString()),
                        defaultValue: getValidDateForInput(
                          fields.effective_from.initialValue,
                        ),
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
                      key={0}
                      className="capitalize"
                      options={paymentTemplatesOptions}
                      inputProps={{
                        ...getInputProps(fields.payment_template, { type: "text" }),
                      }}
                      placeholder={`Select ${fields.payment_template.name}`}
                      labelProps={{
                        children: replaceUnderscore(fields.payment_template.name),
                      }}
                      errors={fields.payment_template.errors}
                    />
                    <SearchableSelectField
                      key={1}
                      className="capitalize"
                      options={eligibilityOptions}
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
                  <Button onClick={createEmployeeLink} variant="default" className="w-full">Link Template</Button>
                </Form>
              </FormProvider>
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            className="item-start justify-start px-2 font-normal w-full"
            onClick={deleteEmployeeLink}
          >
            Delete link
          </Button>
          <DropdownMenuSeparator />
          <DeleteEmployee employeeId={employee.id} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};