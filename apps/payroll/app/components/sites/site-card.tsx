import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@canny_ecosystem/ui/tooltip";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Form, Link, useNavigate, useNavigation, useSearchParams } from "@remix-run/react";
import { DeleteSite } from "./delete-site";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@canny_ecosystem/ui/card";
import { getPaymentTemplateAssignmentBySiteId, getPaymentTemplatesByCompanyId, type PaymentTemplateAssignmentsType, type SitesWithLocation } from "@canny_ecosystem/supabase/queries";
import { modalSearchParamNames } from "@canny_ecosystem/utils/constant";
import { eligibilityOptionsArray, getInitialValueFromZod, getValidDateForInput, PaymentTemplateFormSiteDialogSchema, positionArray, replaceUnderscore, skillLevelArray, transformStringArrayIntoOptions } from "@canny_ecosystem/utils";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@canny_ecosystem/ui/dialog";
import { Button } from "@canny_ecosystem/ui/button";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import { FormProvider, getFormProps, getInputProps, useForm } from "@conform-to/react";
import { useState, useEffect } from "react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import type { SupabaseEnv } from "@canny_ecosystem/supabase/types";
import { Spinner } from "@canny_ecosystem/ui/spinner";
import { DeleteSitePaymentTemplateAssignment } from "./delete-site-payment-template-assignment";
import SiteLinkedTemplates from "./site-linked-templates";

export function SiteCard({ site, env, companyId }: { site: Omit<SitesWithLocation, "created_at" | "updated_at">, env: SupabaseEnv, companyId: string }) {
  const { supabase } = useSupabase({ env });

  const [searchParams] = useSearchParams();
  const currentPaymentTemplateAssignmentId = searchParams.get("currentPaymentTemplateAssignmentId");
  const action = searchParams.get("action");

  const [initialValues, setInitialValues] = useState(null);
  const [linkedTemplates, setLinkedTemplates] = useState<PaymentTemplateAssignmentsType[] | null>([]);
  const [showSpinner, setShowSpinner] = useState(true);
  const [resetKey, setResetKey] = useState(Date.now());
  const [paymentTemplatesOptions, setPaymentTemplatesOptions] = useState<{
    label: string;
    value: string;
  }[]>([]);

  const navigate = useNavigate();
  const navigation = useNavigation();
  const disableAll = navigation.state === "submitting" || navigation.state === "loading";

  const viewPaySequenceSearchParam = `${modalSearchParamNames.view_pay_sequence}=true`;
  const editPaySequenceSearchParam = `${modalSearchParamNames.edit_pay_sequence}=true`;

  const updateURL = `/templates/${site.project_id}/${site.id}/${currentPaymentTemplateAssignmentId}/update-site-link`;
  const createURL = `/templates/${site.project_id}/${site.id}/create-site-link`;

  const [form, fields] = useForm({
    id: "payment-template-form",
    constraint: getZodConstraint(PaymentTemplateFormSiteDialogSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: PaymentTemplateFormSiteDialogSchema });
    },
    defaultValue: initialValues ?? getInitialValueFromZod(PaymentTemplateFormSiteDialogSchema),
    shouldValidate: 'onInput',
    shouldRevalidate: 'onInput'
  });

  async function setLinkedDataIfExists() {
    const { data } = await getPaymentTemplateAssignmentBySiteId({ supabase, site_id: site.id });

    setLinkedTemplates(data as any);
    setShowSpinner(false);
  }

  const openPaymentTemplateDialog = async () => {
    await setLinkedDataIfExists();
    const { data } = await getPaymentTemplatesByCompanyId({ supabase, company_id: companyId });
    if (data) {
      const newPaymentTemplatesOptions = data?.map((paymentTemplate) => ({ label: paymentTemplate.name, value: paymentTemplate.id }));
      setPaymentTemplatesOptions(newPaymentTemplatesOptions);
    }
  }

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
  }, [currentPaymentTemplateAssignmentId])

  const handleOpenChange = () => {
    navigate(`/projects/${site.project_id}/sites`);
  };

  return (
    <Card
      key={site.id}
      className="w-full select-text cursor-auto dark:border-[1.5px] h-full flex flex-col justify-start"
    >
      <CardHeader className="flex flex-row space-y-0 items-start justify-between p-4">
        <div className="flex flex-col items-start">
          <CardTitle className="text-lg tracking-wide">{site.name}</CardTitle>
          <p className="text-[12px] w-max text-muted-foreground -mt-1 rounded-md">
            {site.site_code}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Link
                  prefetch="intent"
                  to={`/projects/${site.project_id}/${site.id}/update-site`}
                  className="p-2 rounded-md bg-secondary grid place-items-center"
                >
                  <Icon name="edit" size="xs" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger className="p-2 py-2 rounded-md bg-secondary grid place-items-center">
              <Icon name="dots-vertical" size="xs" />
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={10} align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => {
                    navigate(`/projects/${site.project_id}/sites/${site.id}?${viewPaySequenceSearchParam}`);
                  }}
                >
                  View Pay Sequence
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    navigate(`/projects/${site.project_id}/sites/${site.id}?${editPaySequenceSearchParam}`);
                  }}
                >
                  Edit Pay Sequence
                </DropdownMenuItem>
                <DropdownMenuSeparator />
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
                    <DialogTitle className="text-xl font-semibold mb-4">
                      {
                        action ?
                          <>{initialValues ? "Update" : "Create"} payment template</>
                          :
                          <>Linked payment templates</>
                      }

                    </DialogTitle>
                    {
                      action
                        ?
                        <FormProvider context={form.context}>
                          <Form
                            method="POST"
                            {...getFormProps(form)}
                            action={action === "update" ? updateURL : createURL}
                            className="space-y-6 w-full"
                          >
                            <Field
                              className="w-full"
                              inputProps={{
                                ...getInputProps(fields.name, { type: "text" }),
                                className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none",
                                placeholder: "Name",
                                disabled: showSpinner,
                                defaultValue: fields.name.initialValue
                              }}
                              labelProps={{
                                children: replaceUnderscore(fields.name.name),
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
                                  defaultValue: getValidDateForInput(fields.effective_from.initialValue as string), disabled: showSpinner
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
                                  min: getValidDateForInput(fields.effective_from.value as string),
                                  defaultValue: getValidDateForInput(fields.effective_to.initialValue as string),
                                  disabled: showSpinner
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
                                  disabled: showSpinner,
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
                                  disabled: showSpinner,
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
                                  disabled: (showSpinner || fields.eligibility_option.value !== "position"),
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
                                  disabled: (showSpinner || fields.eligibility_option.value !== "skill_level"),
                                  defaultValue: fields.skill_level.initialValue
                                }}
                                placeholder={`Select ${fields.skill_level.name}`}
                                labelProps={{
                                  children: replaceUnderscore(fields.skill_level.name),
                                }}
                                errors={fields.skill_level.errors}
                              />
                            </div>

                            {
                              showSpinner ? <div className="flex justify-center"><Spinner /></div> : <>
                                <Button variant="default" className="w-full" disabled={!form.valid || disableAll}>
                                  {initialValues ? "Update" : "Link"} Template
                                </Button>
                                <div className={`w-full ${!initialValues && "hidden"}`}>
                                  <DeleteSitePaymentTemplateAssignment projectId={site.project_id} templateAssignmentId={currentPaymentTemplateAssignmentId as string} />
                                </div>
                              </>
                            }
                          </Form>
                        </FormProvider>
                        :
                        <SiteLinkedTemplates linkedTemplates={linkedTemplates} />
                    }

                  </DialogContent>
                </Dialog>
                <DropdownMenuSeparator className={cn(!site.latitude && !site.longitude && "hidden")} />
                <DeleteSite projectId={site.project_id} siteId={site.id} />
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-0.5 px-4">
        <address className="not-italic line-clamp-3">
          {`${site.address_line_1} ${site.address_line_2 ? site.address_line_2 : ""}`}
        </address>
        <div className="flex items-center capitalize gap-2">
          <p>{`${site.city},`}</p>
          <p>{`${replaceUnderscore(site.state)}`}</p>
          <p>{`- ${site.pincode}`}</p>
        </div>
      </CardContent>
      <CardFooter className={cn("p-0")}>
        <div
          className={cn(
            "border-t border-r bg-secondary rounded-tr-md text-foreground px-2.5 py-1.5",
            !site.company_location?.name && "opacity-0",
          )}
        >
          {site.company_location?.name}
        </div>
        <div
          className={cn(
            "px-2.5 ml-auto bg-secondary text-foreground py-1.5 h-full items-center text-sm tracking-wide font-sem rounded-tl-md border-foreground flex gap-1 justify-center",
            !site.is_active && "opacity-0",
          )}
        >
          <Icon name="dot-filled" size="xs" />
          Active
        </div>
      </CardFooter>
    </Card >
  );
}