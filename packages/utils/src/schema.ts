import { isValid, z } from "zod";

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
    "Must contain a dot with at least one character before and two after.",
  );

export const SIZE_1MB = 1 * 1024 * 1024; // 1MB
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
    "File size must be less than 1MB",
  )
  .refine(
    (file) =>
      typeof file !== "string"
        ? ACCEPTED_IMAGE_TYPES.includes(file?.type)
        : true,
    "Only .jpg, .jpeg, .png and .webp formats are supported.",
  );

export const zFile = z
  .any()
  .refine(
    (file) => (typeof file !== "string" ? file.size < SIZE_1MB * 5 : true),
    "File size must be less than 5MB",
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
    "Only .jpg, .jpeg, .png .webp, .pdf, .doc and .docx formats are supported.",
  );

export const parseDateSchema = z
  .date()
  .transform((value) => new Date(value))
  .transform((v: any) => isValid(v))
  .refine((v) => !!v, { message: "Invalid date" });

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
  parent_company_id: z.string().optional(),
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
  project_id: z.string().optional(),
});

// Pay Sequence
const daySchema = z.number().int().min(0).max(6);
export const payFrequencyArray = ["monthly"] as const;

export const SitePaySequenceSchema = z.object({
  id: z.string(),
  pay_frequency: z.enum(payFrequencyArray),
  working_days: z.array(daySchema),
  pay_day: z.number().int().min(1).max(15),
  site_id: z.string(),
});

// Employees
export const genderArray = ["male", "female", "unknown", "other"] as const;
export const educationArray = [
  "10th",
  "12th",
  "diploma",
  "graduate",
  "post-graduate",
] as const;
export const maritalStatusArray = [
  "married",
  "unmarried",
] as const

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
  id: z.string().optional(),
  employee_id: z.string().optional(),
  project_site_id: z.string(),
  position: z.enum(positionArray).default("sampler"),
  skill_level: z.enum(skillLevelArray).default("unskilled"),
  assignment_type: z.enum(assignmentTypeArray).default("full_time"),
  supervisor_id: z.string().optional(),
  is_current: z.boolean().default(false),
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
