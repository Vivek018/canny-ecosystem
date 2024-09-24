import { z } from "zod";

export const textMinLength = 1;
export const textMaxLength = 100;

export const zString = z
  .string()
  .min(textMinLength)
  .max(textMaxLength)
  .regex(/^[A-Z._a-z \s]+$/, "Only alphabets are allowed");

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
  .max(textMaxLength * 10)
  .regex(
    /^[A-Z_a-z./ ,0-9 \s]+$/,
    "Only alphabets, numbers, dot, slash and comma are allowed",
  );

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
  )
  .optional();

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

// Theme
export const themes = ["light", "dark", "system"] as const;

export const ThemeFormSchema = z.object({
  theme: z.enum(themes),
});


// Company
export const CompanySchema = z.object({
  id: z.string().optional(),
  name: zNumberString.min(3),
  logo: zImage,
  email_suffix: zEmailSuffix.optional(),
  service_charge: z.number().min(2).max(20),
  reimbursement_charge: z.number().min(0.5).max(20).optional(),
});

export const CompanyDetailsSchema = z.object({
  id: z.string(),
  name: zNumberString.min(3),
  email_suffix: zEmailSuffix,
});


// Project
export const ProjectSchema = z.object({
  id: z.string().optional(),
  name: zNumberString.min(3),
  description: zTextArea.optional(),
  image: zImage,
  starting_date: z
    .string()
    .default(new Date().toISOString().split("T")[0]),
  ending_date: z.string().optional(),
  company_id: z.string().optional(),
});


// Location
export const LocationSchema = z.object({
  id: z.string().optional(),
  name: zString.min(3),
  esic_code: zNumber.min(10).max(17),
  is_main: z.boolean().default(false),
  address: zTextArea,
  state: zString,
  city: zString.min(3),
  pin_code: zNumber.min(6).max(6),
  company_id: z.string().optional(),
});
