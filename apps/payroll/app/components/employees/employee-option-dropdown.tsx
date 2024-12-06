import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import {useNavigation, useSubmit } from "@remix-run/react";
import { DeleteEmployee } from "./delete-employee";
import { useState } from "react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { getInitialValueFromZod, PaymentTemplateFormEmployeeDialogSchema } from "@canny_ecosystem/utils";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import { getPaymentTemplateAssignmentByEmployeeId, getPaymentTemplatesByCompanyId } from "@canny_ecosystem/supabase/queries";
import type { SupabaseEnv } from "@canny_ecosystem/supabase/types";
import { EmployeeDialog } from "../link-template/EmployeeDialog";
import { useForm } from "@conform-to/react";

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
          <EmployeeDialog
            initialValues={initialValues}
            employeId={employee.id}
            form={form}
            fields={fields}
            paymentTemplatesOptions={paymentTemplatesOptions}
            navigation={navigation}
            openPaymentTemplateDialog={openPaymentTemplateDialog}
            resetKey={resetKey}
          />
          <DropdownMenuSeparator />
          <DeleteEmployee employeeId={employee.id} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};