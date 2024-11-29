import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@canny_ecosystem/ui/tooltip";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Form, Link, useNavigate, useSubmit } from "@remix-run/react";
import { DeleteSite } from "./delete-site";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import type { SitesWithLocation } from "@canny_ecosystem/supabase/queries";
import { modalSearchParamNames } from "@canny_ecosystem/utils/constant";
import { getInitialValueFromZod, getValidDateForInput, replaceUnderscore, z } from "@canny_ecosystem/utils";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@canny_ecosystem/ui/dialog";
import { Button } from "@canny_ecosystem/ui/button";
import { Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
import { FormProvider, getFormProps, getInputProps, useForm } from "@conform-to/react";
import { useState } from "react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";

export function SiteCard({ site, projectId }: { site: Omit<SitesWithLocation, "created_at" | "updated_at"> }) {
  const navigate = useNavigate();

  const viewPaySequenceSearchParam = `${modalSearchParamNames.view_pay_sequence}=true`;
  const editPaySequenceSearchParam = `${modalSearchParamNames.edit_pay_sequence}=true`;

  // Template linking.. 
  const submit = useSubmit();
  const [paymentTemplatesOptions, setPaymentTemplatesOptions] = useState<any>([]);
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
  const createSiteLink = (e) => {
    e.preventDefault();
    // return null;
    submit(
      {
        site_id: site.id,
        is_active: false,
        returnTo: `/projects/${projectId}/sites`,
        assignment_type: "site",
        effective_from: fields.effective_from.value,
        effective_to: fields.effective_to.value,
        template_id: fields.payment_template.value
      },
      {
        method: "POST",
        action: `/templates/${projectId}/create-site-link`,
      },
    );
  }

  const deleteSiteLink = () => {
    submit(
      {
        site_id: site.id,
        is_active: false,
        returnTo: `/projects/${projectId}/sites`,
      },
      {
        method: "POST",
        action: `/templates/${projectId}/delete-site-link`,
      },
    );
  }
  
  const paymentTemplateFormDialogSchema = z.object({
    effective_from: z.string().default(new Date().toISOString().split("T")[0]),
    effective_to: z.string().optional(),
    payment_template: z.string()
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
                    navigate(
                      `/projects/${site.project_id}/sites/${site.id}?${viewPaySequenceSearchParam}`,
                    );
                  }}
                >
                  View Pay Sequence
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    navigate(
                      `/projects/${site.project_id}/sites/${site.id}?${editPaySequenceSearchParam}`,
                    );
                  }}
                >
                  Edit Pay Sequence
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* <DropdownMenuItem
                  className={cn("py-2 text-[13px]", !site.latitude && "hidden")}
                  onClick={() => {
                    navigator.clipboard.writeText(String(site.latitude));
                  }}
                >
                  Copy Latitude
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={cn(
                    "py-2 text-[13px]",
                    !site.longitude && "hidden",
                  )}
                  onClick={() => {
                    navigator.clipboard.writeText(String(site.longitude));
                  }}
                >
                  Copy Longitude
                </DropdownMenuItem> */}
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
                        <Button onClick={createSiteLink} variant="default" className="w-full">Link Template</Button>
                      </Form>
                    </FormProvider>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="destructive-ghost"
                  className="item-start justify-start px-2 font-normal w-full"
                  onClick={deleteSiteLink}
                >
                  Delete link
                </Button>
                <DropdownMenuSeparator
                  className={cn(!site.latitude && !site.longitude && "hidden")}
                />
                <DeleteSite projectId={site.project_id} siteId={site.id} />
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-0.5 px-4">
        <address className="not-italic line-clamp-3">
          {`${site.address_line_1} ${site.address_line_2 ? site.address_line_2 : ""
            }`}
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
    </Card>
  );
}
