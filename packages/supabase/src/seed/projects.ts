import { faker } from "@faker-js/faker";
import type { ProjectDatabaseInsert, SiteDatabaseInsert } from "../types";

export function seedProject(): Omit<
  ProjectDatabaseInsert,
  "project_client_id" | "end_client_id" | "primary_contractor_id"
> {
  return {
    name: faker.string.alphanumeric(10),
    project_code: faker.string.sample(5),
    project_type: faker.string.alpha(10),
    status: ["active", "pending", "cancelled", "completed"][
      faker.number.int({ min: 0, max: 3 })
    ],
    start_date: faker.date.past().toISOString(),
    estimated_end_date: faker.date.future().toISOString(),
    description: faker.lorem.paragraph(5),
    environmental_considerations: faker.lorem.paragraph(5),
    quality_standards: faker.lorem.paragraph(5),
    health_safety_requirements: faker.lorem.paragraph(5),
    risk_assessment: faker.lorem.paragraph(5),
  };
}

export function seedProjectSite(): Omit<
  SiteDatabaseInsert,
  "project_id" | "company_location_id"
> {
  return {
    name: faker.string.alpha(10),
    site_code: faker.string.sample(5),
    capacity: faker.number.int({ min: 100, max: 10000 }),
    is_active: [true, false][faker.number.int({ min: 0, max: 1 })],
    address_line_1: faker.location.streetAddress(),
    address_line_2: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    pincode: faker.location.zipCode(),
    latitude: faker.location.latitude(),
    longitude: faker.location.longitude(),
  };
}
