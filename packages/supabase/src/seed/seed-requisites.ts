import { createClient } from "@supabase/supabase-js";
import { employeeLetterTypesArray } from "@canny_ecosystem/utils";
import {
  DEFAULT_APPOINTMENT_LETTER,
  DEFAULT_EXPERIENCE_LETTER,
  DEFAULT_NOC_LETTER,
  DEFAULT_OFFER_LETTER,
  DEFAULT_RELIEVING_LETTER,
  DEFAULT_TERMINATION_LETTER,
  publicHolidays,
} from "@canny_ecosystem/utils/constant";
import type { EmployeeLetterDatabaseInsert } from "../types";
import { faker } from "@faker-js/faker";
import {
  addHolidaysFromData,
  addLeaveTypeFromData,
  createEmployeeLetter,
  createLocation,
  createRelationship,
} from "../mutations";
import { seedCompanyLocations, seedCompanyRelationships } from "./companies";
import { CANNY_MANAGEMENT_SERVICES_COMPANY_ID } from "../../../../apps/management/app/constant";

export async function seedRequisitesForCompanyCreation({
  companyId,
}: {
  companyId: string;
}) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
  );
  await createLocation({
    supabase,
    data: { ...seedCompanyLocations(), company_id: companyId },
    bypassAuth: true,
  });

  // console.time("Created Payment Fields...");
  // await createPaymentField({
  //   supabase,
  //   data: [
  //     {
  //       name: "BASIC",
  //       calculation_type: "percentage_of_ctc",
  //       amount: 50,
  //       payment_type: "fixed",
  //       consider_for_epf: true,
  //       consider_for_esic: true,
  //       is_pro_rata: true,
  //       is_active: true,
  //       company_id: companyId!,
  //     },
  //     {
  //       name: "HRA",
  //       calculation_type: "percentage_of_ctc",
  //       amount: 15,
  //       payment_type: "fixed",
  //       consider_for_epf: true,
  //       consider_for_esic: true,
  //       is_pro_rata: true,
  //       is_active: true,
  //       company_id: companyId!,
  //     },
  //     {
  //       name: "Others",
  //       calculation_type: "percentage_of_ctc",
  //       amount: 25,
  //       payment_type: "fixed",
  //       consider_for_epf: true,
  //       consider_for_esic: true,
  //       is_pro_rata: true,
  //       is_active: true,
  //       company_id: companyId!,
  //     },
  //   ],
  //   bypassAuth: true,
  // });
  // console.timeEnd("Created Payment Fields...");

  // console.time("Created Taxes...");
  // for (let index = 0; index < stateLWFContributions.length; index++) {
  //   await createLabourWelfareFund({
  //     supabase,
  //     data: {
  //       state: stateLWFContributions[index].state.toLowerCase(),
  //       employee_contribution:
  //         stateLWFContributions[index].employee_contribution,
  //       employer_contribution:
  //         stateLWFContributions[index].employer_contribution,
  //       deduction_cycle: stateLWFContributions[index].deduction_cycle as
  //         | "monthly"
  //         | "quarterly"
  //         | "half_yearly"
  //         | "yearly"
  //         | null
  //         | undefined,
  //       company_id: companyId!,
  //       status: true,
  //     },
  //     bypassAuth: true,
  //   });
  // }

  // console.time("Created Professional Taxes...");
  // for (let index = 0; index < stateProfessionalTax.length; index++) {
  //   await createProfessionalTax({
  //     supabase,
  //     data: {
  //       pt_number: `${stateProfessionalTax[index].pt_number}`,
  //       state: stateProfessionalTax[index].state.toLowerCase(),
  //       deduction_cycle: stateProfessionalTax[index].deduction_cycle,
  //       gross_salary_range: stateProfessionalTax[index].gross_salary_range,
  //       company_id: companyId!,
  //     },
  //     bypassAuth: true,
  //   });
  // }
  // console.timeEnd("Created Professional Taxes...");

  // await createEmployeeStateInsurance({
  //   supabase,
  //   data: {
  //     deduction_cycle: ["monthly", "quarterly", "half_yearly", "yearly"][
  //       faker.number.int({ min: 0, max: 3 })
  //     ],
  //     esi_number: faker.string.alphanumeric(10),
  //     employee_contribution: 0.0075,
  //     employer_contribution: 0.0325,
  //     include_employer_contribution: true,
  //     is_default: true,
  //     max_limit: 25000,
  //     company_id: companyId!,
  //   },
  //   bypassAuth: true,
  // });

  // await createEmployeeProvidentFund({
  //   supabase,
  //   data: {
  //     epf_number: faker.string.alphanumeric(10),
  //     deduction_cycle: "monthly",
  //     employee_contribution: 0.12,
  //     employer_contribution: 0.12,
  //     employee_restrict_value: 15000,
  //     employer_restrict_value: 15000,
  //     edli_restrict_value: 0.005,
  //     restrict_employee_contribution: [true, false][
  //       faker.number.int({ min: 0, max: 1 })
  //     ],
  //     restrict_employer_contribution: [true, false][
  //       faker.number.int({ min: 0, max: 1 })
  //     ],
  //     include_employer_contribution: [true, false][
  //       faker.number.int({ min: 0, max: 1 })
  //     ],
  //     include_admin_charges: [true, false][
  //       faker.number.int({ min: 0, max: 1 })
  //     ],
  //     include_employer_edli_contribution: [true, false][
  //       faker.number.int({ min: 0, max: 1 })
  //     ],
  //     is_default: true,
  //     company_id: companyId!,
  //   },
  //   bypassAuth: true,
  // });

  // await createStatutoryBonus({
  //   supabase,
  //   data: {
  //     percentage: 0.083,
  //     payment_frequency: "monthly",
  //     is_default: true,
  //     company_id: companyId!,
  //   },
  //   bypassAuth: true,
  // });

  // await createGratuity({
  //   supabase,
  //   data: {
  //     eligibility_years: 4.5,
  //     max_amount_limit: 15000,
  //     max_multiply_limit: 20,
  //     payment_days_per_year: 15,
  //     present_day_per_year: 240,
  //     is_default: true,
  //     company_id: companyId!,
  //   },
  //   bypassAuth: true,
  // });

  // await createLeaveEncashment({
  //   supabase,
  //   data: {
  //     eligible_years: 5,
  //     encashment_frequency:
  //       encashmentFreqArray[faker.number.int({ min: 0, max: 3 })],
  //     encashment_multiplier: faker.number.int({ min: 1, max: 5 }),
  //     max_encashable_leaves: faker.number.int({ min: 1, max: 30 }),
  //     max_encashment_amount: faker.number.int({ min: 100000, max: 500000 }),
  //     working_days_per_year: faker.number.int({ min: 1, max: 30 }),
  //     is_default: true,
  //     company_id: companyId!,
  //   },
  //   bypassAuth: true,
  // });
  // console.timeEnd("Created Taxes...");
  await createRelationship({
    supabase,
    data: {
      ...seedCompanyRelationships(),
      parent_company_id: companyId!,
      child_company_id: CANNY_MANAGEMENT_SERVICES_COMPANY_ID,
    },
    bypassAuth: true,
  });
  await addLeaveTypeFromData({
    supabase,
    data: [
      {
        leave_type: "casual_leave",
        leaves_per_year: 12,
        company_id: companyId!,
      },
      {
        leave_type: "sick_leave",
        leaves_per_year: 12,
        company_id: companyId!,
      },
      {
        leave_type: "paid_leave",
        leaves_per_year: 12,
        company_id: companyId!,
      },
      {
        leave_type: "unpaid_leave",
        leaves_per_year: 43,
        company_id: companyId!,
      },
      {
        leave_type: "paternity_leave",
        leaves_per_year: 12,
        company_id: companyId!,
      },
    ],
  });

  await addHolidaysFromData({
    supabase,
    data: publicHolidays.map((holiday) => ({
      ...holiday,
      company_id: companyId!,
    })),
  });
}

export async function seedRequisitesForEmployeeCreation({
  employeeId,
}: {
  employeeId: string;
}) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
  );
  for (let index = 0; index < employeeLetterTypesArray.length - 1; index++) {
    const letterType = employeeLetterTypesArray[index];
    const content =
      letterType === "appointment_letter"
        ? DEFAULT_APPOINTMENT_LETTER
        : letterType === "experience_letter"
          ? DEFAULT_EXPERIENCE_LETTER
          : letterType === "noc_letter"
            ? DEFAULT_NOC_LETTER
            : letterType === "offer_letter"
              ? DEFAULT_OFFER_LETTER
              : letterType === "relieving_letter"
                ? DEFAULT_RELIEVING_LETTER
                : letterType === "termination_letter"
                  ? DEFAULT_TERMINATION_LETTER
                  : null;

    const letterData: Omit<
      EmployeeLetterDatabaseInsert,
      "created_at" | "updated_at"
    > = {
      letter_type: letterType,
      subject: faker.lorem.sentence(3),
      date: faker.date.past().toISOString(),
      content,
      include_client_address: [true, false][
        faker.number.int({ min: 0, max: 1 })
      ],
      include_employee_signature: [true, false][
        faker.number.int({ min: 0, max: 1 })
      ],
      include_letter_head: [true, false][faker.number.int({ min: 0, max: 1 })],
      include_our_address: [true, false][faker.number.int({ min: 0, max: 1 })],
      include_signatuory: [true, false][faker.number.int({ min: 0, max: 1 })],
      employee_id: employeeId,
    };

    await createEmployeeLetter({
      supabase,
      letterData,
      bypassAuth: true,
    });
  }
}
