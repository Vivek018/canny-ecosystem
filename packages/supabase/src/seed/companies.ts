import { faker } from "@faker-js/faker";
import type {
  CompanyDatabaseInsert,
  CompanyRegistrationDetailsInsert,
  LocationDatabaseInsert,
  RelationshipDatabaseInsert,
} from "../types";

export function seedCompany(): CompanyDatabaseInsert {
  const companyName = faker.company.name();
  return {
    name: companyName,
    email_suffix: `${companyName.toLowerCase()}.${faker.internet.domainSuffix()}`,
    company_size: ["small", "medium", "enterprise"][
      faker.number.int({ min: 0, max: 2 })
    ],
    company_type: ["sub_contractor", "project_client", "end_client"][
      faker.number.int({ min: 0, max: 2 })
    ],
    is_active: [true, false][faker.number.int({ min: 0, max: 1 })],
  };
}

export function seedCompanyRegistrationDetails(): Omit<
  CompanyRegistrationDetailsInsert,
  "company_id"
> {
  return {
    registration_number: faker.string.alphanumeric(10),
    gst_number: faker.string.alphanumeric(15),
    pan_number: faker.string.alphanumeric(10),
    pf_number: faker.string.alphanumeric(10),
    esic_number: faker.string.alphanumeric(10),
    lwf_number: faker.string.alphanumeric(10),
    pt_number: faker.string.alphanumeric(10),
  };
}

export function seedCompanyLocations(): Omit<
  LocationDatabaseInsert,
  "company_id"
> {
  return {
    name: faker.string.alpha(10),
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

export function seedCompanyRelationships(): Omit<
  RelationshipDatabaseInsert,
  "parent_company_id" | "child_company_id"
> {
  return {
    relationship_type: faker.string.alpha(10),
    start_date: faker.date.recent().toISOString(),
    end_date: faker.date.future().toISOString(),
    is_active: [true, false][faker.number.int({ min: 0, max: 1 })],
    terms: {
      service_charge: faker.number.float({ min: 2, max: 10 }),
      reimbursement_charge: faker.number.float({ min: 0, max: 10 }),
      credit_days: [0, 15, 45, 60][faker.number.int({ min: 0, max: 3 })],
    },
  };
}
