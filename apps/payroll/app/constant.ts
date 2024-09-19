import type { NavList } from "@canny_ecosystem/types";
import { z } from "zod";

export const CREATE_COMPANY = "create-company";

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


const MAX_SIZE = 1 * 1024 * 1024; // 1MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const zImage = z
  .any()
  .refine(
    (file) => (typeof file !== "string" ? file.size < MAX_SIZE : true),
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
    (file) => (typeof file !== "string" ? file.size < MAX_SIZE * 5 : true),
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

export const sideNavList = [
  { name: "Dashboard", link: "/dashboard", icon: "dashboard" },
  { name: "Employees", link: "/employees", icon: "employee" },
  { name: "Advances", link: "/advances", icon: "lab-timer" },
  {
    name: "Payment Fields",
    link: "/payment_fields",
    icon: "input",
  },
  {
    name: "Payment Data",
    link: "/payment_data",
    icon: "table",
  },
  { name: "Projects", link: "/projects", icon: "project" },
  {
    name: "Locations",
    link: "/locations",
    icon: "pin",
  },
  {
    name: "Settings",
    link: "/settings",
    icon: "setting",
  },
] as NavList[];

export const navList = [
  ...sideNavList,
  { name: "Analytics", link: "/analytics", icon: "chart" },
  { name: "Users", link: "/users", icon: "avatar" },
  {
    name: "Profile",
    link: "/profile",
    icon: "person",
  },
  {
    name: "Add Users",
    link: "/users/upsert",
    icon: "plus-circled",
  },
  {
    name: "Add Employee",
    link: "/employees/upsert",
    icon: "plus-circled",
  },
  {
    name: "Add Document",
    link: "/documents/upsert",
    icon: "plus-circled",
  },
  {
    name: "Add Company",
    link: "/companies/upsert",
    icon: "plus-circled",
  },
  {
    name: "Add Advance Payment",
    link: "/advances/upsert",
    icon: "plus-circled",
  },
  {
    name: "Add Payment Field",
    link: "/payment_fields/upsert",
    icon: "plus-circled",
  },
  {
    name: "Add Project",
    link: "/projects/upsert",
    icon: "plus-circled",
  },
  {
    name: "Add Project Location",
    link: "/project_locations/upsert",
    icon: "plus-circled",
  },
  {
    name: "Add Vehicle",
    link: "/vehicles/upsert",
    icon: "plus-circled",
  },
] as NavList[];
