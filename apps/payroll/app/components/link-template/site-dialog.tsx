import { Button } from "@canny_ecosystem/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@canny_ecosystem/ui/dialog";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { replaceUnderscore, getValidDateForInput, transformStringArrayIntoOptions, eligibilityOptionsArray, positionArray, skillLevelArray, getInitialValueFromZod, PaymentTemplateFormSiteDialogSchema } from "@canny_ecosystem/utils";
import { FormProvider, getFormProps, getInputProps, useForm } from "@conform-to/react";
import { Form, useNavigate, useNavigation, useSearchParams } from "@remix-run/react";
import { DeleteSitePaymentTemplateAssignment } from "../sites/delete-site-payment-template-assignment";
import { SiteLinkedTemplates } from "../sites/site-linked-templates";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import { useEffect, useState } from "react";
import { type PaymentTemplateAssignmentsType, type SitesWithLocation, getPaymentTemplateAssignmentBySiteId, getPaymentTemplatesByCompanyId } from "@canny_ecosystem/supabase/queries";
import type { SupabaseEnv } from "@canny_ecosystem/supabase/types";

export function SiteDialog({ site, env, companyId }: { site: Omit<SitesWithLocation, "created_at" | "updated_at">, env: SupabaseEnv, companyId: string }) {
    const { supabase } = useSupabase({ env });

    const [searchParams] = useSearchParams();
    const currentPaymentTemplateAssignmentId = searchParams.get("currentPaymentTemplateAssignmentId");
    const action = searchParams.get("action");

    const [initialValues, setInitialValues] = useState(null);
    const [linkedTemplates, setLinkedTemplates] = useState<PaymentTemplateAssignmentsType[] | null>([]);
    const [resetKey, setResetKey] = useState(Date.now());
    const [paymentTemplatesOptions, setPaymentTemplatesOptions] = useState<{
        label: string;
        value: string;
    }[]>([]);

    const navigate = useNavigate();
    const navigation = useNavigation();
    const disableAll = navigation.state === "submitting" || navigation.state === "loading";

    const updateURL = `/templates/${site.project_id}/${site.id}/${currentPaymentTemplateAssignmentId}/update-site-link`;
    const createURL = `/templates/${site.project_id}/${site.id}/create-site-link`;

    async function setLinkedDataIfExists() {
        const { data } = await getPaymentTemplateAssignmentBySiteId({ supabase, site_id: site.id });
        setLinkedTemplates(data);
    }

    const openPaymentTemplateDialog = async () => {
        setResetKey(Date.now());
        setInitialValues(null);
        await setLinkedDataIfExists();
        const { data } = await getPaymentTemplatesByCompanyId({ supabase, company_id: companyId });
        if (data) {
            const newPaymentTemplatesOptions = data?.map((paymentTemplate) => ({ label: paymentTemplate.name, value: paymentTemplate.id }));
            setPaymentTemplatesOptions(newPaymentTemplatesOptions);
        }
        form.reset();
    }

    const handleOpenChange = () => {
        navigate(`/projects/${site.project_id}/sites`);
    };

    const [form, fields] = useForm({
        id: "payment-template-form",
        constraint: getZodConstraint(PaymentTemplateFormSiteDialogSchema),
        onValidate({ formData }) {
            return parseWithZod(formData, { schema: PaymentTemplateFormSiteDialogSchema });
        },
        defaultValue: getInitialValueFromZod(PaymentTemplateFormSiteDialogSchema),
        shouldValidate: 'onInput',
        shouldRevalidate: 'onInput'
    });

    useEffect(() => {
        setResetKey(Date.now());
        setInitialValues(null);
    }, [action]);

    useEffect(() => {
        if (currentPaymentTemplateAssignmentId) {
            if (linkedTemplates) {
                const currentPaymentTemplate = linkedTemplates.find((linkedTemplate: { id: string; }) => linkedTemplate.id === currentPaymentTemplateAssignmentId);

                if (currentPaymentTemplate) {
                    const values = {
                        effective_from: currentPaymentTemplate.effective_from as string,
                        effective_to: currentPaymentTemplate.effective_to,
                        template_id: currentPaymentTemplate.template_id,
                        name: currentPaymentTemplate.name as string,
                        eligibility_option: currentPaymentTemplate.eligibility_option,
                        position: currentPaymentTemplate.position,
                        skill_level: currentPaymentTemplate.skill_level
                    };

                    setInitialValues(values as any);
                    setResetKey(Date.now())
                    form.update({ value: values });
                }
            }
        }
    }, [currentPaymentTemplateAssignmentId]);

    return (
        <Dialog onOpenChange={handleOpenChange}>
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
                <DialogTitle className="text-xl font-semibold mb-4">{initialValues ? "Update" : "Create"}{" "}Link Payment Template</DialogTitle>
                {
                    action
                        ?
                        <FormProvider context={form.context}>
                            <Form
                                method="POST"
                                {...getFormProps(form)}
                                action={action === "update" ? updateURL : createURL}
                            >
                                <Field
                                    className="w-full"
                                    inputProps={{
                                        ...getInputProps(fields.name, { type: "text" }),
                                        placeholder: "Name",
                                        defaultValue: fields.name.initialValue
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
                                            defaultValue: getValidDateForInput(fields.effective_from.initialValue as string)
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
                                            defaultValue: getValidDateForInput(fields.effective_to.initialValue as string),
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
                                        options={paymentTemplatesOptions}
                                        inputProps={{
                                            ...getInputProps(fields.template_id, { type: "text" }),
                                            defaultValue: fields.template_id.initialValue
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
                                        options={transformStringArrayIntoOptions(eligibilityOptionsArray as unknown as string[])}
                                        inputProps={{
                                            ...getInputProps(fields.eligibility_option, { type: "text" }),
                                            defaultValue: fields.eligibility_option.initialValue
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
                                        options={transformStringArrayIntoOptions(positionArray as unknown as string[])}
                                        inputProps={{
                                            ...getInputProps(fields.position, { type: "text" }),
                                            defaultValue: fields.position.initialValue,
                                            disabled: (fields.eligibility_option.value !== "position"),
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
                                        options={transformStringArrayIntoOptions(skillLevelArray as unknown as string[])}
                                        inputProps={{
                                            ...getInputProps(fields.skill_level, { type: "text" }),
                                            defaultValue: fields.skill_level.initialValue,
                                            disabled: (fields.eligibility_option.value !== "skill_level"),
                                        }}
                                        placeholder={`Select ${fields.skill_level.name}`}
                                        labelProps={{
                                            children: replaceUnderscore(fields.skill_level.name),
                                        }}
                                        errors={fields.skill_level.errors}
                                    />
                                </div>
                                <Button variant="default" className="w-full" disabled={!form.valid || disableAll}>
                                    {initialValues ? "Update" : "Create"}{" "}link template
                                </Button>
                                <div className={cn("w-full mt-3", !initialValues && "hidden")}>
                                    <DeleteSitePaymentTemplateAssignment projectId={site.project_id} templateAssignmentId={currentPaymentTemplateAssignmentId as string} />
                                </div>
                            </Form>
                        </FormProvider>
                        :
                        <SiteLinkedTemplates linkedTemplates={linkedTemplates} />
                }

            </DialogContent>
        </Dialog>
    )
}