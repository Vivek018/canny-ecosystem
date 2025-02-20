import type { PaymentTemplateAssignmentsType } from "@canny_ecosystem/supabase/queries";
import type { PaymentTemplateAssignmentsDatabaseUpdate } from "@canny_ecosystem/supabase/types";
import { Button } from "@canny_ecosystem/ui/button";
import type { ComboboxSelectOption } from "@canny_ecosystem/ui/combobox";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import {
  eligibilityOptionsArray, getInitialValueFromZod, getValidDateForInput, SiteLinkSchema,
  positionArray, replaceUnderscore, skillLevelArray, transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import { modalSearchParamNames } from "@canny_ecosystem/utils/constant";
import { FormProvider, getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, useNavigation, useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { DeleteSitePaymentTemplateAssignment } from "../sites/delete-site-payment-template-assignment";
import { cn } from "@canny_ecosystem/ui/utils/cn";

export const SiteDialogForm = ({
  siteId, projectId, linkTemplates, paymentTemplateOptions,
}: {
  siteId: string;
  projectId: string;
  linkTemplates: PaymentTemplateAssignmentsType[];
  paymentTemplateOptions: ComboboxSelectOption[];
}) => {
  const [initialValues, setInitialValues] =
    useState<PaymentTemplateAssignmentsDatabaseUpdate | null>(null);
  const [resetKey, setResetKey] = useState(Date.now());

  const [searchParams] = useSearchParams();
  const currentPaymentTemplateAssignmentId = searchParams.get("currentPaymentTemplateAssignmentId");
  const action = searchParams.get("action");

  const navigation = useNavigation();
  const disableAll = navigation.state === "submitting" || navigation.state === "loading";

  const updateURL =
    `/templates/${projectId}/${siteId}/${currentPaymentTemplateAssignmentId}/update-site-link`;
  const createURL = `/templates/${projectId}/${siteId}/create-site-link`;

  const isUpdateAction = action === modalSearchParamNames.update_link_template;

  useEffect(() => {
    setResetKey(Date.now());
    setInitialValues(null);
  }, [action]);

  useEffect(() => {
    if (currentPaymentTemplateAssignmentId) {
      if (linkTemplates) {
        const currentPaymentTemplate = linkTemplates.find(
          (linkedTemplate: { id: string }) =>
            linkedTemplate.id === currentPaymentTemplateAssignmentId,
        );

        if (currentPaymentTemplate) {
          const values = {
            effective_from: currentPaymentTemplate.effective_from as string,
            effective_to: currentPaymentTemplate.effective_to,
            template_id: currentPaymentTemplate.template_id,
            name: currentPaymentTemplate.name as string,
            eligibility_option: currentPaymentTemplate.eligibility_option,
            position: currentPaymentTemplate.position,
            skill_level: currentPaymentTemplate.skill_level,
          };

          setInitialValues(values);
          setResetKey(Date.now());
          form.update({ value: values });
        }
      }
    } else {
      setResetKey(Date.now());
      setInitialValues(null);
    }
  }, [currentPaymentTemplateAssignmentId]);

  const [form, fields] = useForm({
    id:
      isUpdateAction && initialValues
        ? "update-payment-template"
        : "create-payment-template",
    constraint: getZodConstraint(SiteLinkSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: SiteLinkSchema,
      });
    },
    defaultValue: isUpdateAction
      ? initialValues ?? getInitialValueFromZod(SiteLinkSchema)
      : getInitialValueFromZod(SiteLinkSchema),
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
  });

  return (
    <FormProvider context={form.context}>
      <Form
        method="POST"
        {...getFormProps(form)}
        action={
          action === modalSearchParamNames.update_link_template ? updateURL : createURL
        }
      >
        <Field
          className="w-full"
          inputProps={{
            ...getInputProps(fields.name, { type: "text" }),
            placeholder: "Name",
            defaultValue: fields.name.initialValue,
          }}
          labelProps={{
            children: replaceUnderscore(fields.name.name),
          }}
          errors={fields.name.errors}
        />
        <div className="grid grid-cols-2 gap-4">
          <Field
            className="w-full"
            inputProps={{
              ...getInputProps(fields.effective_from, { type: "date" }),
              placeholder: replaceUnderscore(fields.effective_from.name),
              max: getValidDateForInput(new Date().toISOString()),
              defaultValue: getValidDateForInput(
                fields.effective_from.initialValue as string,
              ),
            }}
            labelProps={{
              children: replaceUnderscore(fields.effective_from.name),
            }}
            errors={fields.effective_from.errors}
          />
          <Field
            className="w-full"
            inputProps={{
              ...getInputProps(fields.effective_to, { type: "date" }),
              placeholder: replaceUnderscore(fields.effective_to.name),
              min: getValidDateForInput(fields.effective_from.value as string),
              defaultValue: getValidDateForInput(
                fields.effective_to.initialValue as string,
              ),
            }}
            labelProps={{
              children: replaceUnderscore(fields.effective_to.name),
            }}
            errors={fields.effective_to.errors}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <SearchableSelectField
            key={resetKey}
            className="capitalize"
            options={paymentTemplateOptions}
            inputProps={{
              ...getInputProps(fields.template_id, { type: "text" }),
              defaultValue: fields.template_id.initialValue,
            }}
            placeholder={"Select payment templates"}
            labelProps={{
              children: "Payment templates",
            }}
            errors={fields.template_id.errors}
          />
          <SearchableSelectField
            key={resetKey + 1}
            className="capitalize"
            options={transformStringArrayIntoOptions(
              eligibilityOptionsArray as unknown as string[],
            )}
            inputProps={{
              ...getInputProps(fields.eligibility_option, {
                type: "text",
              }),
              defaultValue: fields.eligibility_option.initialValue,
            }}
            placeholder={`Select ${fields.eligibility_option.name}`}
            labelProps={{
              children: replaceUnderscore(fields.eligibility_option.name),
            }}
            errors={fields.eligibility_option.errors}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <SearchableSelectField
            key={resetKey + 2}
            className="capitalize"
            options={transformStringArrayIntoOptions(
              positionArray as unknown as string[],
            )}
            inputProps={{
              ...getInputProps(fields.position, { type: "text" }),
              defaultValue: fields.position.initialValue,
              disabled: fields.eligibility_option.value !== "position",
            }}
            placeholder={`Select ${fields.position.name}`}
            labelProps={{
              children: replaceUnderscore(fields.position.name),
            }}
            errors={fields.position.errors}
          />
          <SearchableSelectField
            key={resetKey + 3}
            className="capitalize"
            options={transformStringArrayIntoOptions(
              skillLevelArray as unknown as string[],
            )}
            inputProps={{
              ...getInputProps(fields.skill_level, { type: "text" }),
              defaultValue: fields.skill_level.initialValue,
              disabled: fields.eligibility_option.value !== "skill_level",
            }}
            placeholder={`Select ${fields.skill_level.name}`}
            labelProps={{
              children: replaceUnderscore(fields.skill_level.name),
            }}
            errors={fields.skill_level.errors}
          />
        </div>
        <Button
          variant="default"
          className="w-full"
          disabled={!form.valid || disableAll}
        >
          {isUpdateAction ? "Update" : "Create"} link template
        </Button>
        <div className={cn("w-full mt-3", !initialValues && "hidden")}>
          <DeleteSitePaymentTemplateAssignment
            projectId={projectId}
            templateAssignmentId={currentPaymentTemplateAssignmentId!}
          />
        </div>
      </Form>
    </FormProvider>
  );
};
