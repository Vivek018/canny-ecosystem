import { faker } from "@faker-js/faker";
import type { ProjectDatabaseInsert, SiteDatabaseInsert } from "../types";

export function seedProject(): Omit<
  ProjectDatabaseInsert,
  "company_id"
> {
  return {
    name: faker.string.alphanumeric(10),
    project_type: faker.string.alpha(10),
    status: ["active", "pending", "cancelled", "completed"][
      faker.number.int({ min: 0, max: 3 })
    ],
    description: faker.lorem.paragraph(5),
    start_date: faker.date.past().toISOString(),
    end_date: faker.date.future().toISOString(),
  };
}

export function seedSite(): Omit<
  SiteDatabaseInsert,
  "project_id" | "company_location_id"
> {
  return {
    name: faker.string.alpha(10),
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
