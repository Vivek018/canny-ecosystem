import { Button } from "@canny_ecosystem/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@canny_ecosystem/ui/dialog";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import { StatusButton } from "@canny_ecosystem/ui/status-button";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  replaceUnderscore,
  getValidDateForInput,
  getInitialValueFromZod,
  EmployeeLinkSchema,
} from "@canny_ecosystem/utils";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { Form, useNavigation } from "@remix-run/react";
import { DeleteEmployeePaymentTemplateAssignment } from "../employees/delete-employee-payment-template-assignment";
import type {PaymentTemplateAssignmentsDatabaseUpdate, SupabaseEnv } from "@canny_ecosystem/supabase/types";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import {
  getPaymentTemplateAssignmentByEmployeeId,
  getPaymentTemplatesByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { useState } from "react";
import type { ComboboxSelectOption } from "@canny_ecosystem/ui/combobox";

export function EmployeeDialog({
  employee,
  env,
}: {
  employee: {
    id: string;
    is_active: boolean;
    returnTo?: string;
    companyId: string;
  };
  env: SupabaseEnv;
}) {
  const { supabase } = useSupabase({ env });
  const navigation = useNavigation();

  const [paymentTemplatesOptions, setPaymentTemplatesOptions] = useState<
    ComboboxSelectOption[]
  >([]);
  const [initialValues, setInitialValues] = useState<PaymentTemplateAssignmentsDatabaseUpdate | null>(null);
  const [resetKey, setResetKey] = useState(Date.now());

  const disableAll =
    navigation.state === "submitting" || navigation.state === "loading";

  const [form, fields] = useForm({
    id: "payment-template-form",
    constraint: getZodConstraint(EmployeeLinkSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: EmployeeLinkSchema,
      });
    },
    defaultValue:
      initialValues ??
      getInitialValueFromZod(EmployeeLinkSchema),
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
  });

  async function setLinkedDataIfExists() {
    const { data } = await getPaymentTemplateAssignmentByEmployeeId({
      supabase,
      employeeId: employee.id,
    });
    if (data) {
      const values = {
        effective_from: data.effective_from,
        effective_to: data.effective_to,
        template_id: data.template_id,
        name: data.name,
      };
      setInitialValues(values);
      setResetKey(Date.now());
      form.update({ value: values });
    }
  }

  const openPaymentTemplateDialog = async () => {
    await setLinkedDataIfExists();
    const { data } = await getPaymentTemplatesByCompanyId({
      supabase,
      companyId: employee.companyId,
    });
    if (data) {
      const newPaymentTemplatesOptions = data?.map((paymentTemplate) => ({
        label: paymentTemplate.name,
        value: paymentTemplate.id ?? "",
      }));
      setPaymentTemplatesOptions(newPaymentTemplatesOptions);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          className='item-start justify-start px-2 font-normal w-full'
          onClick={openPaymentTemplateDialog}
        >
          Link template
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogTitle className='text-xl font-semibold mb-4'>
          {initialValues ? "Update" : "Create"} Link Payment Template
        </DialogTitle>
        <FormProvider context={form.context}>
          <Form
            method='POST'
            {...getFormProps(form)}
            action={`/templates/${employee.id}/${
              initialValues ? "update" : "create"
            }-employee-link`}
          >
            <Field
              className='w-full'
              inputProps={{
                ...getInputProps(fields.name, { type: "text" }),
                placeholder: "Name",
              }}
              labelProps={{
                children: fields.name.name,
              }}
              errors={fields.name.errors}
            />
            <div className='grid grid-cols-2 gap-4'>
              <Field
                className='w-full'
                inputProps={{
                  ...getInputProps(fields.effective_from, { type: "date" }),
                  placeholder: replaceUnderscore(fields.effective_from.name),
                  max: getValidDateForInput(new Date().toISOString()),
                  defaultValue: getValidDateForInput(
                    fields.effective_from.initialValue
                  ),
                }}
                labelProps={{
                  children: replaceUnderscore(fields.effective_from.name),
                }}
                errors={fields.effective_from.errors}
              />
              <Field
                className='w-full'
                inputProps={{
                  ...getInputProps(fields.effective_to, { type: "date" }),
                  placeholder: replaceUnderscore(fields.effective_to.name),
                  min: getValidDateForInput(fields.effective_from.value),
                  defaultValue: getValidDateForInput(
                    fields.effective_to.initialValue
                  ),
                }}
                labelProps={{
                  children: replaceUnderscore(fields.effective_to.name),
                }}
                errors={fields.effective_to.errors}
              />
            </div>
            <SearchableSelectField
              key={resetKey}
              className='capitalize'
              options={paymentTemplatesOptions}
              inputProps={{
                ...getInputProps(fields.template_id, { type: "text" }),
              }}
              placeholder={"Select templates"}
              labelProps={{
                children: "Payment templates",
              }}
              errors={fields.template_id.errors}
            />
            <StatusButton
              status={navigation.state === "submitting" ? "pending" : "idle"}
              variant='default'
              className='w-full capitalize'
              disabled={!form.valid || disableAll}
            >
              {initialValues ? "Update" : "Create"} link template
            </StatusButton>
            <div className={cn("w-full mt-3", !initialValues && "hidden")}>
              <DeleteEmployeePaymentTemplateAssignment
                employeeId={employee.id}
              />
            </div>
          </Form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
