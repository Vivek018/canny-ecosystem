import { Button } from "@canny_ecosystem/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@canny_ecosystem/ui/dialog";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { replaceUnderscore, getValidDateForInput, transformStringArrayIntoOptions, eligibilityOptionsArray, positionArray, skillLevelArray } from "@canny_ecosystem/utils";
import { FormProvider, getFormProps, getInputProps } from "@conform-to/react";
import { Form, useNavigate } from "@remix-run/react";
import { DeleteSitePaymentTemplateAssignment } from "../sites/delete-site-payment-template-assignment";
import { SiteLinkedTemplates } from "../sites/site-linked-templates";

export function SiteDialog({
    openPaymentTemplateDialog,
    initialValues,
    form,
    fields,
    paymentTemplatesOptions,
    resetKey,
    disableAll,
    linkedTemplates,
    projectId,
    currentPaymentTemplateAssignmentId,
    action,
    updateURL,
    createURL
}: any) {
    const navigate = useNavigate();
    const handleOpenChange = () => {
        navigate(`/projects/${projectId}/sites`);
    };
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
                                            defaultValue: fields.position.initialValue
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
                                            defaultValue: fields.skill_level.initialValue
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
                                    <DeleteSitePaymentTemplateAssignment projectId={projectId} templateAssignmentId={currentPaymentTemplateAssignmentId as string} />
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
