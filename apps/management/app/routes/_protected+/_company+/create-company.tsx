import {
  CompanySchema,
  encashmentFreqArray,
  isGoodStatus,
} from "@canny_ecosystem/utils";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { getInitialValueFromZod } from "@canny_ecosystem/utils";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigate } from "@remix-run/react";
import { json } from "@remix-run/node";
import { Card } from "@canny_ecosystem/ui/card";
import { useEffect, useState } from "react";
import { CreateCompanyDetails } from "@/components/company/form/create-company-details";
import { FormButtons } from "@/components/form/form-buttons";
import { faker } from "@faker-js/faker";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { clearAllCache } from "@/utils/cache";
import {
  addHolidaysFromData,
  createCompany,
  createEmployeeProvidentFund,
  createEmployeeStateInsurance,
  createGratuity,
  createLabourWelfareFund,
  createLeaveEncashment,
  createProfessionalTax,
  createRelationship,
  createStatutoryBonus,
} from "@canny_ecosystem/supabase/mutations";
import {
  CANNY_MANAGEMENT_SERVICES_COMPANY_ID,
  DEFAULT_ROUTE,
} from "@/constant";
import {
  publicHolidays,
  stateLWFContributions,
  stateProfessionalTax,
} from "@canny_ecosystem/utils/constant";
import { seedCompanyRelationships } from "../../../../../../packages/supabase/src/seed/companies";

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response> {
  const { supabase } = getSupabaseWithHeaders({ request });

  try {
    const formData = await request.formData();
    const submission = parseWithZod(formData, { schema: CompanySchema });
    if (submission.status !== "success") {
      return json(
        { result: submission.reply() },
        { status: submission.status === "error" ? 400 : 200 },
      );
    }
    const { status, error, companyId } = await createCompany({
      supabase,
      companyData: submission.value,
    });

    if (isGoodStatus(status)) {
      stateLWFContributions.map((lwf) =>
        createLabourWelfareFund({
          supabase,
          data: {
            state: lwf.state.toLowerCase(),
            employee_contribution: lwf.employee_contribution,
            employer_contribution: lwf.employer_contribution,
            deduction_cycle: lwf.deduction_cycle as
              | "monthly"
              | "quarterly"
              | "half_yearly"
              | "yearly"
              | null
              | undefined,
            company_id: companyId!,
            status: true,
          },
          bypassAuth: true,
        }).catch((error) => {
          console.error("LWF Creation Error:", error);
          return null;
        }),
      );
      stateProfessionalTax.map((pt) =>
        createProfessionalTax({
          supabase,
          data: {
            pt_number: `${pt.pt_number}`,
            state: pt.state.toLowerCase(),
            deduction_cycle: pt.deduction_cycle,
            gross_salary_range: JSON.stringify(pt.gross_salary_range),
            company_id: companyId!,
          },
          bypassAuth: true,
        }).catch((error) => {
          console.error("PT Creation Error:", error, "Data:", pt);
          return null;
        }),
      );

      await createEmployeeStateInsurance({
        supabase,
        data: {
          deduction_cycle: ["monthly", "quarterly", "half_yearly", "yearly"][
            faker.number.int({ min: 0, max: 3 })
          ],
          esi_number: faker.string.alphanumeric(10),
          employee_contribution: 0.0075,
          employer_contribution: 0.0325,
          include_employer_contribution: true,
          is_default: true,
          max_limit: 25000,
          company_id: companyId!,
        },
        bypassAuth: true,
      });

      await createEmployeeProvidentFund({
        supabase,
        data: {
          epf_number: faker.string.alphanumeric(10),
          deduction_cycle: "monthly",
          employee_contribution: 0.12,
          employer_contribution: 0.12,
          employee_restrict_value: 15000,
          employer_restrict_value: 15000,
          edli_restrict_value: 0.005,
          terms: { fields: "basic, da" },
          restrict_employee_contribution: [true, false][
            faker.number.int({ min: 0, max: 1 })
          ],
          restrict_employer_contribution: [true, false][
            faker.number.int({ min: 0, max: 1 })
          ],
          include_employer_contribution: [true, false][
            faker.number.int({ min: 0, max: 1 })
          ],
          include_admin_charges: [true, false][
            faker.number.int({ min: 0, max: 1 })
          ],
          include_employer_edli_contribution: [true, false][
            faker.number.int({ min: 0, max: 1 })
          ],
          is_default: true,
          company_id: companyId!,
        },
        bypassAuth: true,
      });

      await createStatutoryBonus({
        supabase,
        data: {
          percentage: 0.083,
          payment_frequency: "monthly",
          is_default: true,
          company_id: companyId!,
        },
        bypassAuth: true,
      });

      await createGratuity({
        supabase,
        data: {
          eligibility_years: 4.5,
          max_amount_limit: 15000,
          max_multiply_limit: 20,
          payment_days_per_year: 15,
          present_day_per_year: 240,
          is_default: true,
          company_id: companyId!,
        },
        bypassAuth: true,
      });

      await createLeaveEncashment({
        supabase,
        data: {
          eligible_years: 5,
          encashment_frequency:
            encashmentFreqArray[faker.number.int({ min: 0, max: 3 })],
          encashment_multiplier: faker.number.int({ min: 1, max: 5 }),
          max_encashable_leaves: faker.number.int({ min: 1, max: 30 }),
          max_encashment_amount: faker.number.int({ min: 100000, max: 500000 }),
          working_days_per_year: faker.number.int({ min: 1, max: 30 }),
          is_default: true,
          company_id: companyId!,
        },
        bypassAuth: true,
      });
      await createRelationship({
        supabase,
        data: {
          ...seedCompanyRelationships(),
          parent_company_id: companyId!,
          child_company_id: CANNY_MANAGEMENT_SERVICES_COMPANY_ID,
        },
        bypassAuth: true,
      });

      await addHolidaysFromData({
        supabase,
        data: publicHolidays.map((holiday) => ({
          ...holiday,
          company_id: companyId!,
        })),
      });
      return json({
        status: "success",
        message: "Company created successfully",
        error: null,
      });
    }

    return json({
      status: "error",
      message: "Failed to create Company",
      error,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        returnTo: DEFAULT_ROUTE,
        error,
      },
      { status: 500 },
    );
  }
}

export default function CreateCompany() {
  const [resetKey, setResetKey] = useState(Date.now());

  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  const initialValues = getInitialValueFromZod(CompanySchema);

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearAllCache();
        toast({
          title: "Success",
          description: actionData?.message || "Company created successfully",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error?.message ||
            actionData?.error ||
            actionData?.message ||
            "Failed to create company",
          variant: "destructive",
        });
      }
      navigate(actionData?.returnTo ?? DEFAULT_ROUTE);
    }
  }, [actionData]);

  const [form, fields] = useForm({
    id: "Create-Company",
    constraint: getZodConstraint(CompanySchema),
    onValidate: ({ formData }: { formData: FormData }) => {
      return parseWithZod(formData, { schema: CompanySchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: initialValues,
  });

  return (
    <section className="px-4 lg:px-10 xl:px-14 2xl:px-40 py-4">
      <FormProvider context={form.context}>
        <Form method="POST" {...getFormProps(form)} className="flex flex-col">
          <Card>
            <div className="h-[500px] overflow-scroll">
              <CreateCompanyDetails key={resetKey} fields={fields as any} />
            </div>
            <FormButtons form={form} setResetKey={setResetKey} />
          </Card>
        </Form>
      </FormProvider>
    </section>
  );
}
