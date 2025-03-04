import { z } from "zod";

export { z };

export const textMinLength = 1;
export const textMaxLength = 100;

export const zString = z
  .string()
  .min(textMinLength)
  .max(textMaxLength)
  .regex(/^[A-Z._a-z, \s]+$/, "Only alphabets are allowed");

export const zNumberString = z
  .string()
  .min(textMinLength)
  .max(textMaxLength)
  .regex(/^[A-Z_a-z0-9 \s]+$/, "Only alphabets and numbers are allowed");

export const zNumber = z
  .string()
  .min(textMinLength)
  .max(textMaxLength)
  .regex(/^[0-9]+$/, "Only numbers are allowed");

export const zTextArea = z
  .string()
  .min(20)
  .max(textMaxLength * 5);

export const zEmail = z.string().email();
export const zEmailSuffix = z
  .string()
  .min(4)
  .max(20)
  .regex(
    /^[A-Za-z0-9]+\.[A-Za-z]{2,}$/,
    "Must contain a dot with at least one character before and two after."
  );

export const SIZE_1KB = 1 * 1024; //1KB
export const SIZE_1MB = 1 * SIZE_1KB * SIZE_1KB; // 1MB

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const zImage = z
  .any()
  .refine(
    (file) => (typeof file !== "string" ? file.size < SIZE_1MB : true),
    "File size must be less than 1MB"
  )
  .refine(
    (file) =>
      typeof file !== "string"
        ? ACCEPTED_IMAGE_TYPES.includes(file?.type)
        : true,
    "Only .jpg, .jpeg, .png and .webp formats are supported."
  );

export const zFile = z
  .any()
  .refine(
    (file) => (typeof file !== "string" ? file.size < SIZE_1MB * 5 : true),
    "File size must be less than 5MB"
  )
  .refine(
    (file) =>
      typeof file !== "string"
        ? [
            ...ACCEPTED_IMAGE_TYPES,
            "image/pdf",
            "image/doc",
            "image/docx",
            "application/pdf",
            "application/doc",
            "application/docx",
          ].includes(file?.type)
        : true,
    "Only .jpg, .jpeg, .png .webp, .pdf, .doc and .docx formats are supported."
  );

export const booleanArray = ["true", "false"] as const;

// Theme
export const themes = ["light", "dark", "system"] as const;

export const ThemeFormSchema = z.object({
  theme: z.enum(themes),
});

export const company_type = [
  "project_client",
  "sub_contractor",
  "app_creator",
  "end_client",
] as const;

export const company_size = ["small", "medium", "large", "enterprise"] as const;

// Company
export const CompanySchema = z.object({
  id: z.string().optional(),
  name: zNumberString.min(3).max(50),
  logo: zImage.optional(),
  email_suffix: zEmailSuffix.max(20).optional(),
  company_type: z.enum(company_type).default("project_client"),
  company_size: z.enum(company_size).default("enterprise"),
});

export const CompanyDetailsSchema = z.object({
  id: z.string().optional(),
  name: zNumberString.min(3).max(32),
  email_suffix: zEmailSuffix.max(32).optional(),
  company_type: z.enum(company_type).optional(),
  company_size: z.enum(company_size).optional(),
});

// Company Registration Details
export const CompanyRegistrationDetailsSchema = z.object({
  company_id: z.string().optional(),
  registration_number: zNumberString.max(15).optional(),
  gst_number: zNumberString.max(15).optional(),
  pan_number: zNumberString.max(10).optional(),
  pf_number: zNumberString.max(20).optional(),
  esic_number: zNumberString.max(20).optional(),
  pt_number: zNumberString.max(20).optional(),
  lwf_number: zNumberString.max(20).optional(),
});

// Company Locations
export const LocationSchema = z.object({
  id: z.string().optional(),
  name: zString.min(3),
  is_primary: z.boolean().default(false),
  address_line_1: z
    .string()
    .min(3)
    .max(textMaxLength * 2),
  address_line_2: z
    .string()
    .max(textMaxLength * 2)
    .optional(),
  state: zString,
  city: zString.min(3),
  pincode: zNumber.min(6).max(6),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  company_id: z.string().optional(),
});

// Company Relationships
export const RelationshipSchema = z.object({
  id: z.string().optional(),
  relationship_type: zString.min(3),
  parent_company_id: z.string(),
  child_company_id: z.string().optional(),
  is_active: z.boolean().default(false),
  terms: z.string().transform((str, ctx) => {
    try {
      return JSON.parse(str);
    } catch (_e) {
      ctx.addIssue({ code: "custom", message: "Invalid JSON string" });
      return z.NEVER;
    }
  }),
  start_date: z.string().default(new Date().toISOString().split("T")[0]),
  end_date: z.string().optional(),
});

// Project
export const statusArray = [
  "active",
  "inactive",
  "pending",
  "completed",
  "cancelled",
] as const;

export const ProjectSchema = z.object({
  id: z.string().optional(),
  name: zNumberString.min(3),
  project_code: zNumberString.min(3).max(20),
  project_type: zNumberString.min(3).max(50),
  description: zTextArea.optional(),
  project_client_id: z.string(),
  end_client_id: z.string().optional(),
  primary_contractor_id: z.string().optional(),
  start_date: z.string().default(new Date().toISOString().split("T")[0]),
  estimated_end_date: z.string().optional(),
  status: z.enum(statusArray).default("active"),
  risk_assessment: zTextArea.optional(),
  quality_standards: zTextArea.optional(),
  health_safety_requirements: zTextArea.optional(),
  environmental_considerations: zTextArea.optional(),
});

// Project Sites
export const SiteSchema = z.object({
  id: z.string().optional(),
  name: zString.min(3).max(50),
  site_code: zNumberString.min(3).max(20),
  company_location_id: z.string(),
  is_active: z.boolean().default(false),
  address_line_1: z
    .string()
    .min(3)
    .max(textMaxLength * 2),
  address_line_2: z
    .string()
    .max(textMaxLength * 2)
    .optional(),
  state: zString,
  city: zString.min(3),
  pincode: zNumber.min(6).max(6),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  project_id: z.string(),
});

// Pay Sequence
const daySchema = z.number().int().min(0).max(6);
export const payFrequencyArray = ["monthly"] as const;

export const PaySequenceSchema = z.object({
  name: z.string().min(3).max(20),
  overtime_multiplier: z.number().default(1.0),
  working_days: z.array(daySchema).default([1, 2, 3, 4, 5, 6]),
  pay_day: z.number().int().min(1).max(28).default(1),
  company_id: z.string(),
  is_default: z.boolean().default(false),
});

// Employees
export const genderArray = ["male", "female", "unknown", "other"] as const;
export const educationArray = [
  "10th",
  "12th",
  "diploma",
  "graduate",
  "post_graduate",
] as const;
export const maritalStatusArray = ["married", "unmarried"] as const;

export const EmployeeSchema = z.object({
  id: z.string().optional(),
  first_name: zString.min(3),
  middle_name: zString.min(3).optional(),
  last_name: zString.min(3),
  employee_code: zNumberString.min(3),
  photo: zImage.optional(),
  marital_status: z.enum(maritalStatusArray).default("unmarried"),
  date_of_birth: z.string(),
  gender: z.enum(genderArray).default("male"),
  education: z.enum(educationArray).optional(),
  is_active: z.boolean().default(false),
  primary_mobile_number: zNumber.min(10).max(10),
  secondary_mobile_number: zNumber.min(10).max(10).optional(),
  personal_email: zEmail.optional(),
  company_id: z.string(),
});

export const EmployeeStatutorySchema = z.object({
  employee_id: z.string().optional(),
  aadhaar_number: zNumber.min(12).max(12),
  pan_number: zNumberString.max(10).optional(),
  uan_number: zNumberString.max(12),
  pf_number: zNumberString.max(20),
  esic_number: zNumberString.max(20),
  driving_license_number: zNumberString.max(20).optional(),
  driving_license_expiry: z.string().optional(),
  passport_number: zNumberString.max(20).optional(),
  passport_expiry: z.string().optional(),
});

export const accountTypeArray = ["savings", "current", "salary"] as const;

export const EmployeeBankDetailsSchema = z.object({
  employee_id: z.string().optional(),
  account_number: zNumber.min(10).max(20),
  ifsc_code: zNumberString.min(3).max(11),
  account_holder_name: zString.min(3).optional(),
  account_type: z.enum(accountTypeArray).default("savings"),
  bank_name: zString.min(3),
  branch_name: zNumberString.min(3).optional(),
});

export const EmployeeAddressesSchema = z.object({
  id: z.string().optional(),
  employee_id: z.string().optional(),
  address_type: zString.min(3).max(20),
  is_primary: z.boolean().default(false),
  address_line_1: z
    .string()
    .min(3)
    .max(textMaxLength * 2),
  address_line_2: z
    .string()
    .max(textMaxLength * 2)
    .optional(),
  state: zString,
  city: zString.min(3),
  pincode: zNumber.min(6).max(6),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const relationshipArray = [
  "father",
  "mother",
  "spouse",
  "other",
] as const;

export const EmployeeGuardiansSchema = z.object({
  id: z.string().optional(),
  employee_id: z.string().optional(),
  relationship: z.enum(relationshipArray).optional(),
  first_name: zString.min(3).max(50).optional(),
  last_name: zString.min(3).max(50).optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(genderArray).optional(),
  is_emergency_contact: z.boolean().default(false),
  address_same_as_employee: z.boolean().default(false),
  mobile_number: zNumber.min(10).max(10).optional(),
  alternate_mobile_number: zNumber.min(10).max(10).optional(),
  email: zEmail.optional(),
});

export const positionArray = [
  "supervisor",
  "sampler",
  "helper",
  "driver",
  "chemist",
  "field_operator",
  "technician",
  "inspector",
  "mechanic",
  "coordinator",
  "electrician",
  "welder",
  "scaffolder",
  "heavy_equipment_operator",
  "plumber",
  "unknown",
] as const;

export const assignmentTypeArray = [
  "full_time",
  "part_time",
  "contract",
  "temporary",
] as const;

export const skillLevelArray = [
  "unskilled",
  "semi_skilled",
  "skilled",
] as const;

export const EmployeeProjectAssignmentSchema = z.object({
  employee_id: z.string().optional(),
  project_site_id: z.string(),
  position: z.enum(positionArray).default("sampler"),
  skill_level: z.enum(skillLevelArray).default("unskilled"),
  assignment_type: z.enum(assignmentTypeArray).default("full_time"),
  supervisor_id: z.string().optional(),
  start_date: z.string().default(new Date().toISOString().split("T")[0]),
  end_date: z.string().optional(),
  probation_period: z.boolean().default(false),
  probation_end_date: z.string().optional(),
});

export const proficiencyArray = ["beginner", "intermediate", "expert"] as const;

export const EmployeeSkillsSchema = z.object({
  id: z.string().optional(),
  employee_id: z.string().optional(),
  skill_name: zString.min(3),
  proficiency: z.enum(proficiencyArray).default("beginner"),
  years_of_experience: z.number().int().min(0).max(99).optional(),
});

export const EmployeeWorkHistorySchema = z.object({
  id: z.string().optional(),
  employee_id: z.string().optional(),
  position: z.enum(positionArray),
  company_name: zString.min(3),
  responsibilities: zTextArea.optional(),
  start_date: z.string(),
  end_date: z.string(),
});

export const paymentTypeArray = ["fixed", "variable"] as const;
export const calculationTypeArray = ["fixed", "percentage_of_ctc"] as const;

export const PaymentFieldSchemaObject = z.object({
  id: z.string().uuid().optional(),
  name: zString,
  payment_type: z.enum(paymentTypeArray).default("fixed"),
  calculation_type: z.enum(calculationTypeArray).default("fixed"),
  amount: z.number().optional(),
  is_active: z.boolean().default(false),
  is_pro_rata: z.boolean().default(false),
  consider_for_epf: z.boolean().default(false),
  consider_for_esic: z.boolean().default(false),
  company_id: z.string().uuid(),
});

export const PaymentFieldSchema = PaymentFieldSchemaObject.refine(
  (data) =>
    !(data.payment_type === "variable" && data.calculation_type !== "fixed"),
  {
    message: `When payment type is "variable", calculation type must be "fixed".`,
    path: ["calculation_type"],
  }
);

export const deductionCycleArray = ["monthly"] as const;
export const EMPLOYEE_RESTRICTED_VALUE = 15000;
export const EMPLOYER_RESTRICTED_VALUE = 15000;
export const EDLI_RESTRICTED_VALUE = 75;
export const EMPLOYEE_RESTRICTED_RATE = 0.12;
export const EMPLOYER_RESTRICTED_RATE = 0.12;

export const EmployeeProvidentFundSchema = z.object({
  id: z.string().optional(),
  company_id: z.string(),
  epf_number: z.string().max(20),
  deduction_cycle: z.enum(deductionCycleArray).default(deductionCycleArray[0]),
  employee_contribution: z.number().default(EMPLOYEE_RESTRICTED_RATE),
  employer_contribution: z.number().default(EMPLOYER_RESTRICTED_RATE),
  employee_restrict_value: z.number().default(EMPLOYEE_RESTRICTED_VALUE),
  employer_restrict_value: z.number().default(EMPLOYER_RESTRICTED_VALUE),
  restrict_employer_contribution: z.boolean().default(false),
  restrict_employee_contribution: z.boolean().default(false),
  include_employer_contribution: z.boolean().default(false),
  edli_restrict_value: z.number().default(EDLI_RESTRICTED_VALUE),
  include_employer_edli_contribution: z.boolean().default(false),
  include_admin_charges: z.boolean().default(false),
  is_default: z.boolean().default(true),
});

export const ESI_EMPLOYEE_CONTRIBUTION = 0.0075;
export const ESI_EMPLOYER_CONTRIBUTION = 0.0325;
export const ESI_MAX_LIMIT = 21000;

export const EmployeeStateInsuranceSchema = z.object({
  id: z.string().optional(),
  company_id: z.string(),
  esi_number: zNumberString,
  deduction_cycle: z.enum(deductionCycleArray).default(deductionCycleArray[0]),
  employees_contribution: z.number().default(ESI_EMPLOYEE_CONTRIBUTION),
  employers_contribution: z.number().default(ESI_EMPLOYER_CONTRIBUTION),
  include_employer_contribution: z.boolean().default(false),
  is_default: z.boolean().default(true),
  max_limit: z.number().default(ESI_MAX_LIMIT),
});

export const ProfessionalTaxSchema = z.object({
  id: z.string().optional(),
  company_id: z.string(),
  state: zString,
  pt_number: zNumberString.max(20),
  deduction_cycle: z.enum(deductionCycleArray).default(deductionCycleArray[0]),
  gross_salary_range: z.any().optional(),
});

export const lwfDeductionCycleArray = [
  "monthly",
  "quarterly",
  "half_yearly",
  "yearly",
] as const;

export const LabourWelfareFundSchema = z.object({
  id: z.string().optional(),
  company_id: z.string(),
  state: z.string(),
  employee_contribution: z.number().default(6),
  employer_contribution: z.number().default(12),
  deduction_cycle: z
    .enum(lwfDeductionCycleArray)
    .default(lwfDeductionCycleArray[0]),
  status: z.boolean().default(false),
});

export const statutoryBonusPayFrequencyArray = ["monthly", "yearly"] as const;
export const StatutoryBonusSchema = z
  .object({
    id: z.string().optional(),
    company_id: z.string(),
    payment_frequency: z
      .enum(statutoryBonusPayFrequencyArray)
      .default(statutoryBonusPayFrequencyArray[0]),
    percentage: z.number().min(0).default(8.33),
    payout_month: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.payment_frequency === "yearly" && !data.payout_month) {
      ctx.addIssue({
        path: ["payout_month"],
        message: "payout_month is required when payment_freq is 'monthly'",
        code: z.ZodIssueCode.custom,
      });
    }

    if (data.payment_frequency === "monthly") {
      if (data.payout_month !== null) {
        data.payout_month = undefined;
      }
    }
  });

export const GratuitySchema = z.object({
  id: z.string().optional(),
  company_id: z.string(),
  is_default: z.boolean().default(true),
  eligibility_years: z.number().min(0).default(4.5),
  present_day_per_year: z.number().min(1).max(365).default(240),
  payment_days_per_year: z.number().min(1).max(365).default(15),
  max_multiply_limit: z.number().min(0).default(20),
  max_amount_limit: z.number().min(0).default(3000000),
});

export const categoryArray = ["suggestion", "bug", "complain"] as const;
export const severityArray = ["low", "normal", "urgent"] as const;

export const FeedbackSchema = z.object({
  id: z.string().optional(),
  subject: zString.min(3).max(30),
  message: zTextArea.max(500),
  category: z.enum(categoryArray).default("suggestion"),
  severity: z.enum(severityArray).default("normal"),
  user_id: z.string(),
  company_id: z.string(),
});

export const UpdateUserNameSchema = z.object({
  first_name: zString.max(20),
  last_name: zString.max(20),
});
export const UpdateUserContactSchema = z.object({
  email: zEmail,
  mobile_number: zNumber.min(10).max(10),
});

export const userRoles = [
  "master",
  "admin",
  "operation_manager",
  "executive",
] as const;

export const UserSchema = z.object({
  id: z.string().uuid().optional(),
  first_name: zString.max(20),
  last_name: zString.max(20),
  email: zEmail,
  mobile_number: zNumber.min(10).max(10).optional(),
  avatar: zImage.optional(),
  is_active: z.boolean().default(false),
  company_id: z.string(),
  role: z.enum(userRoles),
});

// Exits
export const reasonForExitArray = [
  "resignation",
  "termination",
  "retirement",
  "health_reasons",
  "career_change",
  "other",
] as const;

export const ExitFormSchema = z.object({
  id: z.string().optional(),
  employee_id: z.string(),
  organization_payable_days: z.number().default(0),
  employee_payable_days: z.number().default(0),
  last_working_day: z.string(),
  final_settlement_date: z.string(),
  reason: z.enum(reasonForExitArray).default("other"),
  note: zString.optional(),
  bonus: z.number().default(0),
  leave_encashment: z.number().default(0),
  gratuity: z.number().default(0),
  deduction: z.number().default(0),
});

// Payment Templates
export const PaymentTemplateSchema = z.object({
  id: z.string().uuid().optional(),
  name: zString.min(3).max(50),
  description: zTextArea.max(500).optional(),
  is_active: z.boolean().default(false),
  is_default: z.boolean().default(false),
  company_id: z.string().uuid(),
});

export const statutoryFieldsArray = [
  "epf",
  "esi",
  "bonus",
  "pt",
  "lwf",
] as const;

export const componentTypeArray = [
  "earning",
  "deduction",
  "statutory_contribution",
] as const;

export const PaymentTemplateComponentsSchema = z.object({
  id: z.string().uuid().optional(),
  monthly_ctc: z.number().min(0).max(100000000),
  state: zString,
  payment_template_components: z.array(
    z.object({
      id: z.string().uuid().optional(),
      template_id: z.string().uuid().optional(),
      payment_field_id: z.string().uuid().optional(),
      epf_id: z.string().uuid().optional(),
      esi_id: z.string().uuid().optional(),
      pt_id: z.string().uuid().optional(),
      lwf_id: z.string().uuid().optional(),
      bonus_id: z.string().uuid().optional(),
      target_type: z
        .enum(["payment_field", ...statutoryFieldsArray])
        .default("payment_field"),
      component_type: z.enum(componentTypeArray).default("earning"),
      calculation_value: z.number().optional(),
      display_order: z.number().int().optional(),
    })
  ),
});

// Payment Template Assignment
export const paymentAssignmentTypesArray = ["employee", "site"] as const;
export const eligibilityOptionsArray = ["position", "skill_level"] as const;

// Payment Template Assignment
export const EmployeeLinkSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  effective_from: z.string().default(new Date().toISOString().split("T")[0]),
  effective_to: z.string().optional(),
  template_id: z.string(),
  employee_id: z.string(),
  assignment_type: z.enum(paymentAssignmentTypesArray).default("employee"),
});

export const PaymentTemplateFormSiteDialogSchema = z.object({
  name: z.string(),
  effective_from: z.string().default(new Date().toISOString().split("T")[0]),
  effective_to: z.string().optional(),
  template_id: z.string(),
  eligibility_option: z.enum(eligibilityOptionsArray).optional(),
  position: z.string().optional(),
  skill_level: z.string().optional(),
});

export const DeleteEmployeeLinkSchema = z.object({
  is_active: z.enum(booleanArray).transform((val) => val === "true"),
});

export const SiteLinkSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  effective_from: z.string().default(new Date().toISOString().split("T")[0]),
  effective_to: z.string().optional(),
  template_id: z.string(),
  eligibility_option: z.enum(eligibilityOptionsArray).optional(),
  position: z.string().optional(),
  skill_level: z.string().optional(),
  assignment_type: z.enum(paymentAssignmentTypesArray).default("site"),
  site_id: z.string(),
});

export const reimbursementStatusArray = ["approved", "pending"] as const;

export const ReimbursementSchema = z.object({
  id: z.string().optional(),
  submitted_date: z.string(),
  status: z.enum(reimbursementStatusArray),
  amount: z.number().min(1).max(100000000),
  user_id: z.string().optional(),
  is_deductible: z.boolean().optional().default(false),
  company_id: z.string(),
  employee_id: z.string(),
});

export const ImportReimbursementHeaderSchema = z
  .object({
    submitted_date: z.string(),
    employee_code: z.string(),
    amount: z.string(),
    email: z.string().optional(),
    is_deductible: z.string().optional(),
    status: z.string(),
  })
  .refine(
    (data) => {
      const values = [
        data.submitted_date,
        data.employee_code,
        data.amount,
        data.email,
        data.is_deductible,
        data.status,
      ].filter(Boolean);

      const uniqueValues = new Set(values);
      return uniqueValues.size === values.length;
    },
    {
      message:
        "Some fields have the same value. Please select different options.",
      path: [
        "employee_code",
        "amount",
        "submitted_date",
        "email",
        "is_deductible",
        "status",
      ],
    }
  );

export const ImportSingleReimbursementDataSchema = z.object({
  submitted_date: z.string(),
  employee_code: zNumberString,
  amount: z.preprocess(
    (value) => (typeof value === "string" ? Number.parseFloat(value) : value),
    z.number()
  ),
  email: zEmail.optional(),
  is_deductible: z
    .preprocess(
      (value) =>
        typeof value === "string" ? value.toLowerCase() === "true" : value,
      z.boolean().default(false)
    )
    .default(false),
  status: z.enum(reimbursementStatusArray),
});

export const ImportReimbursementDataSchema = z.object({
  data: z.array(ImportSingleReimbursementDataSchema),
});

export const duplicationTypeArray = ["overwrite", "skip"] as const;

export const ImportEmployeeDetailsHeaderSchemaObject = z.object({
  employee_code: z.string(),
  first_name: z.string(),
  middle_name: z.string().optional(),
  last_name: z.string(),
  gender: z.string().optional(),
  education: z.string().optional(),
  marital_status: z.string().optional(),
  is_active: z.string().optional(),
  date_of_birth: z.string(),
  personal_email: z.string().optional(),
  primary_mobile_number: z.string(),
  secondary_mobile_number: z.string().optional(),
});

export const ImportEmployeeDetailsHeaderSchema =
  ImportEmployeeDetailsHeaderSchemaObject.refine(
    (data) => {
      const values = [
        data.employee_code,
        data.first_name,
        data.middle_name,
        data.last_name,
        data.gender,
        data.education,
        data.marital_status,
        data.is_active,
        data.date_of_birth,
        data.personal_email,
        data.primary_mobile_number,
        data.secondary_mobile_number,
      ].filter(Boolean);

      const uniqueValues = new Set(values);
      return uniqueValues.size === values.length;
    },
    {
      message:
        "Some fields have the same value. Please select different options.",
      path: [
        "employee_code",
        "first_name",
        "middle_name",
        "last_name",
        "gender",
        "education",
        "marital_status",
        "is_active",
        "date_of_birth",
        "personal_email",
        "primary_mobile_number",
        "secondary_mobile_number",
      ],
    }
  );

export const ImportSingleEmployeeDetailsDataSchema = z.object({
  first_name: zString.min(3),
  middle_name: zString.min(3).optional(),
  last_name: zString.min(3),
  employee_code: zNumberString.min(3),
  marital_status: z.enum(maritalStatusArray).default("unmarried"),
  date_of_birth: z.string(),
  gender: z.enum(genderArray).default("male"),
  education: z.enum(educationArray).optional(),
  is_active: z
    .preprocess(
      (value) =>
        typeof value === "string" ? value.toLowerCase() === "true" : value,
      z.boolean().default(false)
    )
    .default(false),
  primary_mobile_number: z.preprocess((value) => {
    const parsed = typeof value === "string" ? Number.parseFloat(value) : value;
    return Number.isNaN(parsed) ? undefined : parsed;
  }, z.number()),
  secondary_mobile_number: z.preprocess((value) => {
    const parsed = typeof value === "string" ? Number.parseFloat(value) : value;
    return Number.isNaN(parsed) ? undefined : parsed;
  }, z.number().optional()),
  personal_email: zEmail.optional(),
});

export const ImportEmployeeDetailsDataSchema = z.object({
  data: z.array(ImportSingleEmployeeDetailsDataSchema),
});

export const ImportEmployeeStatutoryHeaderSchemaObject = z.object({
  employee_code: z.string(),
  aadhaar_number: z.string(),
  pan_number: z.string().optional(),
  uan_number: z.string(),
  pf_number: z.string(),
  esic_number: z.string(),
  driving_license_number: z.string().optional(),
  driving_license_expiry: z.string().optional(),
  passport_number: z.string().optional(),
  passport_expiry: z.string().optional(),
});

export const ImportEmployeeStatutoryHeaderSchema =
  ImportEmployeeStatutoryHeaderSchemaObject.refine(
    (data) => {
      const values = [
        data.employee_code,
        data.aadhaar_number,
        data.pan_number,
        data.uan_number,
        data.pf_number,
        data.esic_number,
        data.driving_license_number,
        data.driving_license_expiry,
        data.passport_number,
        data.passport_expiry,
      ].filter(Boolean);

      const uniqueValues = new Set(values);
      return uniqueValues.size === values.length;
    },
    {
      message:
        "Some fields have the same value. Please select different options.",
      path: [
        "employee_code",
        "aadhaar_number",
        "pan_number",
        "uan_number",
        "pf_number",
        "esic_number",
        "driving_license_number",
        "driving_license_expiry",
        "passport_number",
        "passport_expiry",
      ],
    }
  );

export const ImportSingleEmployeeStatutoryDataSchema = z.object({
  employee_code: zNumberString.min(3),
  aadhaar_number: zNumber.min(12).max(12),
  pan_number: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().max(10).optional()
  ),
  uan_number: zNumberString.max(12),
  pf_number: zNumberString.max(20),
  esic_number: zNumberString.max(20),
  driving_license_number: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().max(20).optional()
  ),
  driving_license_expiry: z.string().optional(),
  passport_number: zNumberString.max(20).optional(),
  passport_expiry: z.string().optional(),
});

export const ImportEmployeeStatutoryDataSchema = z.object({
  data: z.array(ImportSingleEmployeeStatutoryDataSchema),
});

export const ImportEmployeeBankDetailsHeaderSchemaObject = z.object({
  employee_code: z.string(),
  account_holder_name: z.string().optional(),
  account_number: z.string(),
  ifsc_code: z.string(),
  account_type: z.string().optional(),
  bank_name: z.string(),
  branch_name: z.string().optional(),
});

export const ImportEmployeeBankDetailsHeaderSchema =
  ImportEmployeeBankDetailsHeaderSchemaObject.refine(
    (data) => {
      const values = [
        data.employee_code,
        data.account_holder_name,
        data.account_number,
        data.ifsc_code,
        data.account_type,
        data.bank_name,
        data.branch_name,
      ].filter(Boolean);

      const uniqueValues = new Set(values);
      return uniqueValues.size === values.length;
    },
    {
      message:
        "Some fields have the same value. Please select different options.",
      path: [
        "employee_code",
        "account_holder_name",
        "account_number",
        "ifsc_code",
        "account_type",
        "bank_name",
        "branch_name",
      ],
    }
  );

export const ImportSingleEmployeeBankDetailsDataSchema = z.object({
  employee_code: zNumberString.min(3),
  account_number: zNumber.min(10).max(20),
  ifsc_code: zNumberString.min(3).max(11),
  account_holder_name: zString.min(3).optional(),
  account_type: z.enum(accountTypeArray).default("savings"),
  bank_name: zString.min(3),
  branch_name: zNumberString.min(3).optional(),
});

export const ImportEmployeeBankDetailsDataSchema = z.object({
  data: z.array(ImportSingleEmployeeBankDetailsDataSchema),
});

export const ImportEmployeeAddressHeaderSchemaObject = z.object({
  employee_code: z.string(),
  address_type: z.string(),
  address_line_1: z.string(),
  address_line_2: z.string(),
  city: z.string(),
  pincode: z.string(),
  state: z.string(),
  country: z.string(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  is_primary: z.string().optional(),
});

export const ImportEmployeeAddressHeaderSchema =
  ImportEmployeeAddressHeaderSchemaObject.refine(
    (data) => {
      const values = [
        data.employee_code,
        data.address_type,
        data.address_line_1,
        data.address_line_2,
        data.city,
        data.pincode,
        data.state,
        data.country,
        data.latitude,
        data.longitude,
        data.is_primary,
      ].filter(Boolean);

      const uniqueValues = new Set(values);
      return uniqueValues.size === values.length;
    },
    {
      message:
        "Some fields have the same value. Please select different options.",
      path: [
        "employee_code",
        "address_type",
        "address_line_1",
        "address_line_2",
        "city",
        "pincode",
        "state",
        "country",
        "latitude",
        "longitude",
        "is_primary",
      ],
    }
  );

export const ImportSingleEmployeeAddressDataSchema = z.object({
  employee_code: zNumberString.min(3),
  address_type: zString.min(3).max(20),
  is_primary: z.preprocess(
    (value) =>
      typeof value === "string" ? value.toLowerCase() === "true" : value,
    z.boolean().default(false)
  ),
  address_line_1: z
    .string()
    .min(3)
    .max(textMaxLength * 2),
  address_line_2: z
    .string()
    .max(textMaxLength * 2)
    .optional(),
  state: zString,
  city: zString.min(3),
  pincode: zNumber.min(6).max(6),
  latitude: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().max(180).min(-180).optional()
  ),
  longitude: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().max(180).min(-180).optional()
  ),
});

export const ImportEmployeeAddressDataSchema = z.object({
  data: z.array(ImportSingleEmployeeAddressDataSchema),
});

export const ImportEmployeeGuardiansHeaderSchemaObject = z.object({
  employee_code: z.string().optional(),
  relationship: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  mobile_number: z.string().optional(),
  alternate_mobile_number: z.string().optional(),
  email: z.string().optional(),
  is_emergency_contact: z.string().optional(),
  address_same_as_employee: z.string().optional(),
});
export const ImportEmployeeGuardiansHeaderSchema =
  ImportEmployeeGuardiansHeaderSchemaObject.refine(
    (data) => {
      const values = [
        data.employee_code,
        data.relationship,
        data.first_name,
        data.last_name,
        data.date_of_birth,
        data.gender,
        data.mobile_number,
        data.alternate_mobile_number,
        data.email,
        data.is_emergency_contact,
        data.address_same_as_employee,
      ].filter(Boolean);

      const uniqueValues = new Set(values);
      return uniqueValues.size === values.length;
    },
    {
      message:
        "Some fields have the same value. Please select different options.",
      path: [
        "employee_code",
        "relationship",
        "first_name",
        "last_name",
        "date_of_birth",
        "gender",
        "mobile_number",
        "alternate_mobile_number",
        "email",
        "is_emergency_contact",
        "address_same_as_employee",
      ],
    }
  );

export const ImportSingleEmployeeGuardiansDataSchema = z.object({
  employee_code: zNumberString.min(3),
  relationship: z.enum(relationshipArray).optional(),
  first_name: zString.min(3).max(50).optional(),
  last_name: zString.min(3).max(50).optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(genderArray).optional(),
  is_emergency_contact: z.preprocess(
    (value) =>
      typeof value === "string" ? value.toLowerCase() === "true" : value,
    z.boolean().default(false)
  ),
  address_same_as_employee: z.preprocess(
    (value) =>
      typeof value === "string" ? value.toLowerCase() === "true" : value,
    z.boolean().default(false)
  ),
  mobile_number: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().max(10).min(10).optional()
  ),
  alternate_mobile_number: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().max(10).min(10).optional()
  ),
  email: zEmail.optional(),
});

export const ImportEmployeeGuardiansDataSchema = z.object({
  data: z.array(ImportSingleEmployeeGuardiansDataSchema),
});

// Payroll
export const PayrollSchema = z
  .object({
    employee_id: z.string().optional(),
    site_id: z.string().optional(),
    payrollId: z.string().optional(),
    gross_pay: z.number().optional(),
    statutoryBonus: z.number().optional(),
    epf: z.number().optional(),
    esi: z.number().optional(),
    pt: z.number().optional(),
    lwf: z.number().optional(),
    templateComponents: z.any(),
  })
  .catchall(z.any());

export type PayrollEmployeeData = {
  deductions: number;
  employee_code: string;
  employee_id: string;
  gross_pay: number;
  name: string;
  net_pay: number;
  present_days: number;
  site_id: string;
  status: string;
  designation: string;
  payment_template_components_id: string;
  templateComponents: any;
  payrollId: string;
};

// Exits
export const exitReasonArray = [
  "Resignation",
  "Retirement",
  "Transfer",
  "Termination",
  "Medical",
  "Other",
] as const;

export const ImportExitHeaderSchemaObject = z.object({
  employee_code: z.string(),
  last_working_day: z.string(),
  reason: z.string(),
  final_settlement_date: z.string(),
  organization_payable_days: z.string(),
  employee_payable_days: z.string(),
  bonus: z.string(),
  leave_encashment: z.string(),
  gratuity: z.string(),
  deduction: z.string(),
  note: z.string(),
  net_pay: z.string(),
});

export const ImportExitHeaderSchema = ImportExitHeaderSchemaObject.refine(
  (data) => {
    const values = [
      data.employee_code,
      data.last_working_day,
      data.reason,
      data.final_settlement_date,
      data.organization_payable_days,
      data.employee_payable_days,
      data.bonus,
      data.leave_encashment,
      data.gratuity,
      data.deduction,
      data.note,
      data.net_pay,
    ].filter(Boolean);

    const uniqueValues = new Set(values);
    return uniqueValues.size === values.length;
  },
  {
    message:
      "Some fields have the same value. Please select different options.",
    path: [
      "employee_code",
      "last_working_day",
      "reason",
      "final_settlement_date",
      "organization_payable_days",
      "employee_payable_days",
      "bonus",
      "leave_encashment",
      "gratuity",
      "deduction",
      "note",
      "total",
    ],
  }
);

export const ImportSingleExitDataSchema = z.object({
  employee_code: z.string(),
  last_working_day: z.string(),
  reason: z.string(),
  final_settlement_date: z.preprocess(
    (value) => (typeof value === "string" ? Number.parseFloat(value) : value),
    z.number()
  ),
  organization_payable_days: z.preprocess(
    (value) => (typeof value === "string" ? Number.parseFloat(value) : value),
    z.number()
  ),
  employee_payable_days: z.preprocess(
    (value) => (typeof value === "string" ? Number.parseFloat(value) : value),
    z.number()
  ),
  bonus: z.preprocess(
    (value) => (typeof value === "string" ? Number.parseFloat(value) : value),
    z.number()
  ),
  leave_encashment: z.preprocess(
    (value) => (typeof value === "string" ? Number.parseFloat(value) : value),
    z.number()
  ),
  gratuity: z.preprocess(
    (value) => (typeof value === "string" ? Number.parseFloat(value) : value),
    z.number()
  ),
  deduction: z.preprocess(
    (value) => (typeof value === "string" ? Number.parseFloat(value) : value),
    z.number()
  ),
  note: z.string().optional(),
  net_pay: z.preprocess(
    (value) => (typeof value === "string" ? Number.parseFloat(value) : value),
    z.number()
  ),
});

export const ImportExitDataSchema = z.object({
  data: z.array(ImportSingleExitDataSchema),
});

export const attendanceWorkShiftArray = ["day", "afternoon", "night"] as const;
export const attendanceHolidayTypeArray = [
  "weekly",
  "paid",
  "state",
  "national",
] as const;

export const AttendanceDataSchema = z.object({
  type: z.enum(["add", "update"]),
  date: z.string(),
  no_of_hours: z.number().min(0).max(24).default(8),
  employee_id: z.string(),
  present: z.boolean().default(false),
  holiday: z.boolean().default(false),
  working_shift: z.enum(attendanceWorkShiftArray).optional(),
  holiday_type: z.enum(attendanceHolidayTypeArray).optional(),
});

export const ImportSingleEmployeeAttendanceDataSchema = z.object({
  employee_code: zNumberString.min(3),
  date: z.string(),
  no_of_hours: z.preprocess(
    (value) => (typeof value === "string" ? Number.parseFloat(value) : value),
    z.number().min(0).max(24).default(8)
  ),
  present: z.preprocess(
    (value) =>
      typeof value === "string" ? value.toLowerCase() === "true" : value,
    z.boolean().default(false)
  ),
  holiday: z.preprocess(
    (value) =>
      typeof value === "string" ? value.toLowerCase() === "true" : value,
    z.boolean().default(false)
  ),
  working_shift: z.preprocess(
    (value) =>
      value === "" || value === undefined || value === null ? undefined : value,
    z.enum(attendanceWorkShiftArray).optional()
  ),
  holiday_type: z.preprocess(
    (value) =>
      value === "" || value === undefined || value === null ? undefined : value,
    z.enum(attendanceHolidayTypeArray).optional()
  ),
});

export const ImportEmployeeAttendanceDataSchema = z.object({
  data: z.array(ImportSingleEmployeeAttendanceDataSchema),
});

export const employeeLetterTypesArray = [
  "appointment_letter",
  "experience_letter",
  "offer_letter",
  "noc_letter",
  "relieving_letter",
  "termination_letter",
] as const;

export const EmployeeLetterSchema = z.object({
  id: z.string().optional(),
  include_client_address: z.boolean().default(false),
  include_employee_address: z.boolean().default(false),
  include_our_address: z.boolean().default(false),
  include_letter_head: z.boolean().default(false),
  include_signatuory: z.boolean().default(false),
  include_employee_signature: z.boolean().default(false),
  subject: z.string().min(3).max(100),
  date: z.string().default(new Date().toISOString().split("T")[0]),
  letter_type: z
    .enum(employeeLetterTypesArray)
    .default(employeeLetterTypesArray[0]),
  content: z.string().optional(),
  employee_id: z.string(),
});

export const encashmentFreqArray = ["annual", "exit", "special"] as const;

export const LeaveEncashmentSchema = z.object({
  id: z.string().optional(),
  company_id: z.string(),
  eligible_years: z.number().min(0).default(0),
  max_encashable_leaves: z.number().min(0).max(365).default(0),
  max_encashment_amount: z.number().min(0).default(0),
  encashment_multiplier: z.number().positive().default(1),
  working_days_per_year: z.number().min(1).max(365).default(260),
  encashment_frequency: z
    .enum(encashmentFreqArray)
    .default(encashmentFreqArray[0]),
  is_default: z.boolean().default(true),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const locationTypeArray = ["onsite", "others"] as const;
export const severityTypeArray = [
  "minor",
  "moderate",
  "severe",
  "critical",
  "fatal",
  "unknown",
] as const;

export const categoryOfAccidentArray = [
  "theft",
  "assault",
  "fall",
  "accident",
  "machinery",
  "others",
] as const;

export const AccidentSchema = z.object({
  id: z.string().optional(),
  employee_id: z.string(),
  date: z.string().default(new Date().toISOString().split("T")[0]),
  title: zString.min(3).max(30),
  location_type: z.enum(locationTypeArray).default("onsite"),
  location: z.string().optional(),
  category: z.enum(categoryOfAccidentArray).default("accident"),
  severity: z.enum(severityTypeArray).default("moderate"),
  status: z.enum(statusArray).default("active"),
  description: zTextArea.max(500),
  medical_diagnosis: z.string().optional(),
});

export const leaveTypeArray = [
  "casual_leave",
  "paid_leave",
  "unpaid_leave",
  "sick_leave",
  "paternity_leave",
] as const;

export const LeaveSchema = z.object({
  employee_id: z.string(),
  start_date: z.string(),
  end_date: z.string().optional(),
  reason: z.string().max(100).min(3),
  leave_type: z.enum(leaveTypeArray),
  user_id: z.string().optional(),
});

export const LeaveTypeSchema = z.object({
  company_id: z.string(),
  leaves_per_year: z.number().max(365),
  leave_type: z.enum(leaveTypeArray),
});

export const HolidaysSchema = z.object({
  company_id: z.string(),
  name: z.string().max(20),
  start_date: z.string(),
  no_of_days: z.number().min(1).max(365),
  is_mandatory: z.boolean().optional().default(false),
});

export const caseTypeArray = [
  "dispute",
  "wage_issue",
  "injury",
  "misconduct",
  "legal",
  "contract_violation",
] as const;
export const caseStatusArray = ["open", "resolved", "closed"] as const;
export const reportedByArray = [
  "employee",
  "site",
  "project",
  "company",
  "canny",
  "other",
] as const;
export const reportedOnArray = [
  "employee",
  "site",
  "project",
  "company",
  "canny",
  "other",
] as const;
export const caseLocationTypeArray = ["employee", "site", "other"] as const;

export const CaseSchema = z.object({
  id: z.string().optional(),
  company_id: z.string(),
  date: z.string().default(new Date().toISOString().split("T")[0]),
  title: z.string().min(1, "Title is required"),
  case_type: z.enum(caseTypeArray).default("dispute"),
  status: z.enum(caseStatusArray).default("open"),
  incident_date: z.string().optional(),
  reported_by: z.enum(reportedByArray).default("employee"),
  reported_on: z.enum(reportedOnArray).default("employee"),
  location: z.string().optional(),
  location_type: z.enum(caseLocationTypeArray).default("employee"),
  amount_given: z.number().optional(),
  amount_received: z.number().optional(),
  court_case_reference: z.string().optional(),
  description: zTextArea.optional(),
  document: z.string().url().optional(),
  resolution_date: z.string().optional(),
  reported_on_employee_id: z.string().optional(),
  reported_on_project_id: z.string().optional(),
  reported_on_site_id: z.string().optional(),
  reported_on_company_id: z.string().optional(),
  reported_by_company_id: z.string().optional(),
  reported_by_employee_id: z.string().optional(),
  reported_by_project_id: z.string().optional(),
  reported_by_site_id: z.string().optional(),
});

export const ImportLeavesHeaderSchema = z
  .object({
    employee_code: z.string(),
    start_date: z.string(),
    end_date: z.string(),
    reason: z.string(),
    leave_type: z.string(),
    email: z.string().optional(),
  })
  .refine(
    (data) => {
      const values = [
        data.employee_code,
        data.start_date,
        data.end_date,
        data.reason,
        data.leave_type,
        data.email,
      ].filter(Boolean);

      const uniqueValues = new Set(values);
      return uniqueValues.size === values.length;
    },
    {
      message:
        "Some fields have the same value. Please select different options.",
      path: [
        "employee_code",
        "start_date",
        "end_date",
        "reason",
        "leave_type",
        "email",
      ],
    }
  );

export const ImportSingleLeavesDataSchema = z.object({
  employee_code: zNumberString,
  start_date: z.string(),
  end_date: z.string().optional(),
  reason: z.string().max(100).min(3),
  leave_type: z.enum(leaveTypeArray),
  email: zEmail.optional(),
});

export const ImportLeavesDataSchema = z.object({
  data: z.array(ImportSingleLeavesDataSchema),
});
