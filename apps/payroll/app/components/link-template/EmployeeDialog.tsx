import { Button } from "@canny_ecosystem/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@canny_ecosystem/ui/dialog";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import { StatusButton } from "@canny_ecosystem/ui/status-button";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { replaceUnderscore, getValidDateForInput } from "@canny_ecosystem/utils";
import { FormProvider, getFormProps, getInputProps } from "@conform-to/react";
import { Form } from "@remix-run/react";
import { DeleteEmployeePaymentTemplateAssignment } from "../employees/delete-employee-payment-template-assignment";

export function EmployeeDialog({
    initialValues,
    employeId,
    form,
    fields,
    paymentTemplatesOptions,
    navigation,
    openPaymentTemplateDialog,
    resetKey
}: any) {
    const disableAll = navigation.state === "submitting" || navigation.state === "loading";
    return (
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
                <DialogTitle className="text-xl font-semibold mb-4">{initialValues ? "Update" : "Create"}{" "}Link Payment Template</DialogTitle>
                <FormProvider context={form.context}>
                    <Form
                        method="POST"
                        {...getFormProps(form)}
                        action={`/templates/${employeId}/${initialValues ? "update" : "create"}-employee-link`}
                    >
                        <Field
                            className="w-full"
                            inputProps={{
                                ...getInputProps(fields.name, { type: "text" }),
                                placeholder: "Name",
                            }}
                            labelProps={{
                                children: fields.name.name,
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
                                    defaultValue: getValidDateForInput(fields.effective_from.initialValue),
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
                                    min: getValidDateForInput(fields.effective_from.value),
                                    defaultValue: getValidDateForInput(fields.effective_to.initialValue),
                                }}
                                labelProps={{
                                    children: replaceUnderscore(fields.effective_to.name),
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
                            }}
                            errors={fields.template_id.errors}
                        />
                        <StatusButton
                            status={navigation.state === "submitting" ? "pending" : "idle"}
                            variant="default"
                            className="w-full capitalize"
                            disabled={!form.valid || disableAll}
                        >
                            {initialValues ? "Update" : "Create"}{" "}link template
                        </StatusButton>
                        <div className={cn("w-full mt-3", !initialValues && "hidden")}>
                            <DeleteEmployeePaymentTemplateAssignment employeeId={employeId} />
                        </div>
                    </Form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    )
}
