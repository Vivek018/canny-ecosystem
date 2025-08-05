import type {
  EmployeeProvidentFundDatabaseRow,
  EmployeeStateInsuranceDatabaseRow,
  InferredType,
  LabourWelfareFundDatabaseRow,
  PaymentFieldDatabaseRow,
  PaymentTemplateComponentDatabaseRow,
  PaymentTemplateDatabaseRow,
  ProfessionalTaxDatabaseRow,
  StatutoryBonusDatabaseRow,
  TypedSupabaseClient,
} from "../types";
import { HARD_QUERY_LIMIT } from "../constant";

export async function getPaymentTemplatesByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const columns = [
    "id",
    "name",
    "description",
    "monthly_ctc",
    "state",
    "is_active",
    "is_default",
    "company_id",
  ] as const;

  const { data, error } = await supabase
    .from("payment_templates")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .limit(HARD_QUERY_LIMIT)
    .order("created_at", { ascending: true })
    .returns<
      InferredType<PaymentTemplateDatabaseRow, (typeof columns)[number]>[]
    >();

  if (error) {
    console.error("getPaymentTemplatesByCompanyId Error", error);
  }

  return { data, error };
}

export async function getPaymentTemplateById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "id",
    "name",
    "description",
    "monthly_ctc",
    "state",
    "is_active",
    "is_default",
    "company_id",
  ] as const;

  const { data, error } = await supabase
    .from("payment_templates")
    .select(columns.join(","))
    .eq("id", id)
    .single<
      InferredType<PaymentTemplateDatabaseRow, (typeof columns)[number]>
    >();

  if (error) {
    console.error("getPaymentTemplateById Error", error);
  }

  return { data, error };
}

export async function getPaymentTemplateComponentsByTemplateId({
  supabase,
  templateId,
}: {
  supabase: TypedSupabaseClient;
  templateId: string;
}) {
  const columns = [
    "id",
    "template_id",
    "payment_field_id",
    "epf_id",
    "esi_id",
    "pt_id",
    "lwf_id",
    "bonus_id",
    "target_type",
    "component_type",
    "calculation_value",
    "display_order",
  ] as const;

  const { data, error } = await supabase
    .from("payment_template_components")
    .select(
      `${columns.join(",")}, 
      payment_fields(id, name, amount, payment_type, calculation_type, is_pro_rata, consider_for_epf, consider_for_esic, is_overtime), 
      employee_provident_fund(id, epf_number, deduction_cycle, employee_contribution, employer_contribution, employee_restrict_value, employer_restrict_value, include_employer_edli_contribution, edli_restrict_value, restrict_employee_contribution, restrict_employer_contribution, include_admin_charges, company_id, include_employer_contribution, is_default), 
      employee_state_insurance(id, esi_number, deduction_cycle, employee_contribution, employer_contribution, max_limit, include_employer_contribution, company_id), 
      professional_tax(id, pt_number, deduction_cycle, state, gross_salary_range), 
      labour_welfare_fund(id, state, employee_contribution, employer_contribution, deduction_cycle), 
      statutory_bonus(id, percentage, payment_frequency, payout_month)`,
    )
    .eq("template_id", templateId)
    .order("created_at", { ascending: true })
    .limit(HARD_QUERY_LIMIT)
    .returns<PaymentTemplateComponentType[]>();

  if (error) {
    console.error("getPaymentTemplateComponentsByTemplateId Error", error);
  }

  return { data, error };
}

export async function getPaymentTemplateComponentById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "id",
    "template_id",
    "target_type",
    "payment_field_id",
    "epf_id",
    "esi_id",
    "pt_id",
    "lwf_id",
    "bonus_id",
    "component_type",
    "calculation_value",
    "display_order",
  ] as const;

  const { data, error } = await supabase
    .from("payment_template_components")
    .select(`${columns.join(",")}`)
    .eq("id", id)
    .single<
      InferredType<PaymentTemplateComponentType, (typeof columns)[number]>
    >();

  if (error) console.error("getPaymentTemplateComponentById Error", error);

  return { data, error };
}

export async function getPaymentTemplateWithComponentsById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const { data, error } = await getPaymentTemplateById({ supabase, id });

  let returnData: PaymentTemplateWithComponentsType | null = null;
  let componentsError = null;
  if (data) {
    returnData = {
      id: data.id,
      monthly_ctc: data.monthly_ctc,
      state: data.state,
    };

    const { data: componentsData, error } =
      await getPaymentTemplateComponentsByTemplateId({
        supabase,
        templateId: data.id,
      });

    componentsError = error;

    if (componentsData) {
      returnData.payment_template_components = componentsData;
    }
  }

  return { data: returnData, error, componentsError };
}

export async function getDefaultTemplateIdByCompanyId({
  supabase,
  companyId,
}: { supabase: TypedSupabaseClient; companyId: string }) {
  const columns = ["id"] as const;

  const { data, error } = await supabase
    .from("payment_templates")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .eq("is_default", true)
    .single<
      InferredType<PaymentTemplateDatabaseRow, (typeof columns)[number]>
    >();

  if (error) console.error("getDefaultTemplateIdByCompanyId Error", error);

  return { data, error };
}

export type PaymentTemplateComponentType = Omit<
  PaymentTemplateComponentDatabaseRow,
  "created_at"
> & {
  payment_fields: Pick<
    PaymentFieldDatabaseRow,
    | "id"
    | "name"
    | "amount"
    | "payment_type"
    | "calculation_type"
    | "is_pro_rata"
    | "consider_for_epf"
    | "consider_for_esic"
    | "is_overtime"
  >;
  employee_provident_fund: Pick<
    EmployeeProvidentFundDatabaseRow,
    | "id"
    | "epf_number"
    | "deduction_cycle"
    | "employee_contribution"
    | "employer_contribution"
    | "employee_restrict_value"
    | "employer_restrict_value"
    | "include_employer_edli_contribution"
    | "edli_restrict_value"
    | "restrict_employee_contribution"
    | "restrict_employer_contribution"
    | "include_admin_charges"
    | "company_id"
    | "include_employer_contribution"
    | "is_default"
  >;
  employee_state_insurance: Pick<
    EmployeeStateInsuranceDatabaseRow,
    | "id"
    | "esi_number"
    | "deduction_cycle"
    | "employee_contribution"
    | "employer_contribution"
    | "max_limit"
    | "include_employer_contribution"
    | "company_id"
  >;
  professional_tax: Pick<
    ProfessionalTaxDatabaseRow,
    "id" | "pt_number" | "deduction_cycle" | "state" | "gross_salary_range"
  >;
  labour_welfare_fund: Pick<
    LabourWelfareFundDatabaseRow,
    | "id"
    | "state"
    | "employee_contribution"
    | "employer_contribution"
    | "deduction_cycle"
  >;
  statutory_bonus: Pick<
    StatutoryBonusDatabaseRow,
    "id" | "percentage" | "payment_frequency" | "payout_month"
  >;
};

export type PaymentTemplateWithComponentsType = Pick<
  PaymentTemplateDatabaseRow,
  "monthly_ctc" | "state" | "id"
> & {
  payment_template_components?: Omit<
    PaymentTemplateComponentDatabaseRow,
    "created_at"
  >[];
};
