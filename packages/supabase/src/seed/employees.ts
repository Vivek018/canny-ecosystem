import { faker } from "@faker-js/faker";
import type {
  EmployeeAddressDatabaseInsert,
  EmployeeBankDetailsDatabaseInsert,
  EmployeeDatabaseInsert,
  EmployeeGuardianDatabaseInsert,
  EmployeeStatutoryDetailsDatabaseInsert,
} from "../types";

export function seedEmployees(): Omit<EmployeeDatabaseInsert, "company_id"> {
  return {
    first_name: faker.person.firstName(),
    middle_name: faker.person.middleName(),
    last_name: faker.person.lastName(),
    employee_code: faker.string.sample(5),
    date_of_birth: faker.date.past().toISOString(),
    is_active: [true, false][faker.number.int({ min: 0, max: 1 })],
    marital_status: ["married", "unmarried"][
      faker.number.int({ min: 0, max: 1 })
    ],
    gender: ["male", "female"][faker.number.int({ min: 0, max: 1 })],
    primary_mobile_number: faker.string.numeric(10),
    secondary_mobile_number: faker.string.numeric(10),
    education: ["10th", "12th", "graduate", "post-graduate"][
      faker.number.int({ min: 0, max: 3 })
    ],
    personal_email: faker.internet.email(),
  };
}

export function seedEmployeeStatutoryDetails(): Omit<
  EmployeeStatutoryDetailsDatabaseInsert,
  "employee_id"
> {
  return {
    aadhaar_number: faker.string.numeric(12),
    pf_number: faker.string.numeric(10),
    esic_number: faker.string.numeric(10),
    pan_number: faker.string.alphanumeric(10),
    uan_number: faker.string.numeric(12),
    passport_number: faker.string.numeric(10),
    passport_expiry: faker.date.future().toISOString(),
    driving_license_number: faker.string.numeric(10),
    driving_license_expiry: faker.date.future().toISOString(),
  };
}

export function seedEmployeeBankDetails(): Omit<
  EmployeeBankDetailsDatabaseInsert,
  "employee_id"
> {
  return {
    account_holder_name: faker.person.fullName(),
    account_number: faker.string.numeric(10),
    account_type: ["savings", "current"][faker.number.int({ min: 0, max: 1 })],
    ifsc_code: faker.string.alphanumeric(10),
    bank_name: faker.company.name(),
    branch_name: faker.company.buzzPhrase(),
  };
}

export function seedEmployeeAddresses(): Omit<
  EmployeeAddressDatabaseInsert,
  "employee_id"
> {
  return {
    address_type: faker.string.alpha(10),
    is_primary: [true, false][faker.number.int({ min: 0, max: 1 })],
    address_line_1: faker.location.streetAddress(),
    address_line_2: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    pincode: faker.location.zipCode(),
    latitude: faker.location.latitude(),
    longitude: faker.location.longitude(),
  };
}

export function seedEmployeeGuardianDetails(): Omit<
  EmployeeGuardianDatabaseInsert,
  "employee_id"
> {
  return {
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    date_of_birth: faker.date.past().toISOString(),
    is_emergency_contact: [true, false][faker.number.int({ min: 0, max: 1 })],
    relationship: ["father", "mother", "spouse", "other"][
      faker.number.int({ min: 0, max: 3 })
    ],
    address_same_as_employee: [true, false][
      faker.number.int({ min: 0, max: 1 })
    ],
    mobile_number: faker.string.numeric(10),
    alternate_mobile_number: faker.string.numeric(10),
    email: faker.internet.email(),
    gender: ["male", "female"][faker.number.int({ min: 0, max: 1 })],
  };
}
