import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Form, useNavigation, useSubmit } from "@remix-run/react";
import { DeleteEmployee } from "./delete-employee";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@canny_ecosystem/ui/dialog";
import { Button } from "@canny_ecosystem/ui/button";
import { useState } from "react";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import { FormProvider, getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { getInitialValueFromZod, getValidDateForInput, PaymentTemplateFormEmployeeDialogSchema, replaceUnderscore } from "@canny_ecosystem/utils";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import { getPaymentTemplateAssignmentByEmployeeId, getPaymentTemplatesByCompanyId } from "@canny_ecosystem/supabase/queries";
import type { SupabaseEnv } from "@canny_ecosystem/supabase/types";
import { DeleteEmployeePaymentTemplateAssignment } from "./delete-employee-payment-template-assignment";
import { StatusButton } from "@canny_ecosystem/ui/status-button";

export const EmployeeOptionsDropdown = ({ employee, triggerChild, env }: {
  employee: {
    id: string;
    is_active: boolean;
    returnTo?: string;
    companyId: string
  };
  triggerChild: React.ReactElement;
  env: SupabaseEnv
}) => {
  const { supabase } = useSupabase({ env });
  const navigation = useNavigation();

  const disableAll = navigation.state === "submitting" || navigation.state === "loading";

  const [paymentTemplatesOptions, setPaymentTemplatesOptions] = useState<{
    label: string;
    value: string;
  }[]>([]);
  const [initialValues, setInitialValues] = useState(null);
  const [resetKey, setResetKey] = useState(Date.now());

  const submit = useSubmit();

  const [form, fields] = useForm({
    id: "payment-template-form",
    constraint: getZodConstraint(PaymentTemplateFormEmployeeDialogSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: PaymentTemplateFormEmployeeDialogSchema });
    },
    defaultValue: initialValues ?? getInitialValueFromZod(PaymentTemplateFormEmployeeDialogSchema),
    shouldValidate: 'onInput',
    shouldRevalidate: 'onInput',
  });

  async function setLinkedDataIfExists() {
    const { data } = await getPaymentTemplateAssignmentByEmployeeId({
      supabase,
      employee_id: employee.id,
    });
    if (data) {
      const values = {
        effective_from: data.effective_from,
        effective_to: data.effective_to,
        template_id: data.template_id,
        name: data.name
      };
      setInitialValues(values as any);
      setResetKey(Date.now());
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
    await setLinkedDataIfExists();
    const { data } = await getPaymentTemplatesByCompanyId({ supabase, company_id: employee.companyId });
    if (data) {
      const newPaymentTemplatesOptions = data?.map((paymentTemplate) => (
        { label: paymentTemplate.name, value: paymentTemplate.id }
      ));
      setPaymentTemplatesOptions(newPaymentTemplatesOptions);
    }
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
                <Form
                  method="POST"
                  {...getFormProps(form)}
                  className="space-y-6 w-full"
                  action={`/templates/${employee.id}/${initialValues ? "update" : "create"}-employee-link`}
                >
                  <Field
                    className="w-full"
                    inputProps={{
                      ...getInputProps(fields.name, { type: "text" }),
                      className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none",
                      placeholder:"Name",
                    }}
                    labelProps={{
                      children: fields.name.name,
                      className: "block text-sm font-medium text-gray-700"
                    }}
                    errors={fields.name.errors}
                  />
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
                        defaultValue: getValidDateForInput(fields.effective_to.initialValue),
                      }}
                      labelProps={{
                        children: replaceUnderscore(fields.effective_to.name),
                        className: "block text-sm font-medium text-gray-700 mb-1"
                      }}
                      errors={fields.effective_to.errors}
                    />
                  </div>
                  <SearchableSelectField
                    key={resetKey}
                    className="capitalize"
                    options={paymentTemplatesOptions}
                    inputProps={{
                      ...getInputProps(fields.template_id, { type: "text" }),
                    }}
                    placeholder={"Select templates"}
                    labelProps={{
                      children: "Payment templates",
                      className: "block text-sm font-medium text-gray-700 mb-1"
                    }}
                    errors={fields.template_id.errors}
                  />
                  <StatusButton
                    status={navigation.state === "submitting" ? "pending" : "idle"}
                    variant="default"
                    className="w-full"
                    disabled={!form.valid || disableAll}
                  >
                    {initialValues ? "Update" : "Link"} Template
                  </StatusButton>
                  <div className={`w-full ${!initialValues && "hidden"}`}>
                    <DeleteEmployeePaymentTemplateAssignment employeeId={employee.id} />
                  </div>

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