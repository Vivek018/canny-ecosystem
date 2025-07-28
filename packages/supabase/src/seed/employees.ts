import { faker } from "@faker-js/faker";
import type {
  CasesDatabaseInsert,
  CasesDatabaseRow,
  EmployeeAddressDatabaseInsert,
  EmployeeBankDetailsDatabaseInsert,
  EmployeeDatabaseInsert,
  EmployeeGuardianDatabaseInsert,
  EmployeeMonthlyAttendanceDatabaseInsert,
  EmployeeProjectAssignmentDatabaseInsert,
  EmployeeSkillDatabaseInsert,
  EmployeeStatutoryDetailsDatabaseInsert,
  EmployeeWorkHistoryDatabaseInsert,
  IncidentsDatabaseInsert,
  LeavesDatabaseInsert,
} from "../types";
import {
  accountTypeArray,
  assignmentTypeArray,
  caseLocationTypeArray,
  caseStatusArray,
  caseTypeArray,
  categoryOfIncidentArray,
  genderArray,
  locationTypeArray,
  positionArray,
  proficiencyArray,
  relationshipArray,
  severityTypeArray,
  skillLevelArray,
  statusArray,
} from "@canny_ecosystem/utils";

export function seedEmployees(): Omit<EmployeeDatabaseInsert, "company_id"> {
  return {
    first_name: faker.person.firstName(),
    middle_name: faker.person.middleName(),
    last_name: faker.person.lastName(),
    employee_code: faker.string.sample(5),
    date_of_birth: faker.date.past({ years: 50 }).toISOString(),
    is_active: [true, false][faker.number.int({ min: 0, max: 1 })],
    marital_status: ["married", "unmarried"][
      faker.number.int({ min: 0, max: 1 })
    ],
    gender: ["male", "female"][faker.number.int({ min: 0, max: 1 })],
    primary_mobile_number: faker.string.numeric(10),
    secondary_mobile_number: faker.string.numeric(10),
    education: ["10th", "12th", "graduate", "post_graduate"][
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
    account_type:
      accountTypeArray[Math.floor(Math.random() * accountTypeArray.length)],
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
    relationship:
      relationshipArray[Math.floor(Math.random() * relationshipArray.length)],
    address_same_as_employee: [true, false][
      faker.number.int({ min: 0, max: 1 })
    ],
    mobile_number: faker.string.numeric(10),
    alternate_mobile_number: faker.string.numeric(10),
    email: faker.internet.email(),
    gender: genderArray[Math.floor(Math.random() * genderArray.length)],
  };
}

export function seedEmployeeProjectAssignmentDetails(): Omit<
  EmployeeProjectAssignmentDatabaseInsert,
  "employee_id" | "site_id" | "supervisor_id"
> {
  return {
    assignment_type:
      assignmentTypeArray[
        Math.floor(Math.random() * assignmentTypeArray.length)
      ],
    position: positionArray[Math.floor(Math.random() * positionArray.length)],
    skill_level:
      skillLevelArray[Math.floor(Math.random() * skillLevelArray.length)],
    probation_period: [true, false][faker.number.int({ min: 0, max: 1 })],
    probation_end_date: faker.date.future().toISOString(),
    start_date: faker.date.past({ years: 10 }).toISOString(),
    end_date: faker.date.future({ years: 10 }).toISOString(),
  };
}

export function seedEmployeeWorkHistory(): Omit<
  EmployeeWorkHistoryDatabaseInsert,
  "employee_id"
> {
  return {
    position: faker.person.jobTitle(),
    company_name: faker.company.name(),
    responsibilities: faker.person.jobTitle(),
    start_date: faker.date.past().toISOString(),
    end_date: faker.date.future().toISOString(),
  };
}

export function seedEmployeeSkills(): Omit<
  EmployeeSkillDatabaseInsert,
  "employee_id"
> {
  return {
    skill_name: faker.person.jobTitle(),
    proficiency:
      proficiencyArray[Math.floor(Math.random() * proficiencyArray.length)],
    years_of_experience: faker.number.int({ min: 0, max: 10 }),
  };
}

export function seedEmployeeAttendance(
  employeeId: string,
): EmployeeMonthlyAttendanceDatabaseInsert[] {
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  const dates = [];
  for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }

  const employeeAttendances = dates.map((date) => ({
    employee_id: employeeId,
    date: date.toISOString(),
    holiday: faker.datatype.boolean(),
    present: faker.datatype.boolean(),
    no_of_hours: faker.number.int({ min: 0, max: 10 }),
  }));

  return employeeAttendances;
}

export function seedEmployeeLeaves(employeeId: string): LeavesDatabaseInsert[] {
  const year = 2024;
  const numLeaves = faker.number.int({ min: 10, max: 20 });
  const employeeLeaves = [];

  for (let i = 0; i < numLeaves; i++) {
    const startDate = faker.date.between({
      from: new Date(year, 0, 1),
      to: new Date(year, 11, 27),
    }); // Ensuring space for max leave days
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + faker.number.int({ min: 1, max: 4 })); // Ensuring 1 to 4 days gap

    if (endDate > new Date(year, 11, 31)) endDate.setFullYear(year, 11, 31);

    employeeLeaves.push({
      employee_id: employeeId,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      reason: faker.lorem.words(5),
      leave_type: (
        [
          "sick_leave",
          "casual_leave",
          "paid_leave",
          "unpaid_leave",
          "paternity_leave",
        ] as const
      )[faker.number.int({ min: 0, max: 4 })],
    });
  }

  return employeeLeaves;
}

export function seedEmployeeReimbursements(employeeId: string) {
  const employeeReimbursements = [];

  for (
    let i = 0;
    i < (Math.random() < 0.85 ? 0 : faker.number.int({ min: 1, max: 3 }));
    i++
  ) {
    employeeReimbursements.push({
      employee_id: employeeId,
      amount: faker.number.int({ min: 1000, max: 5000 }),
      status: ["approved", "pending", "rejected"][
        faker.number.int({ min: 0, max: 2 })
      ],
      submitted_date: faker.date.past().toISOString(),
    });
  }

  return employeeReimbursements;
}

export function seedEmployeeExits(employeeId: string) {
  const employeeExits = [];

  for (let i = 0; i < (Math.random() < 0.9 ? 0 : 1); i++) {
    employeeExits.push({
      employee_payable_days: faker.number.int({ min: 1, max: 30 }),
      organization_payable_days: faker.number.int({ min: 1000, max: 5000 }),
      final_settlement_date: faker.date.past().toISOString(),
      last_working_day: faker.date.past().toISOString(),
      reason: ["Resignation", "Termination", "Retirement"][
        faker.number.int({ min: 0, max: 2 })
      ],
      bonus: faker.number.int({ min: 1000, max: 5000 }),
      gratuity: faker.number.int({ min: 1000, max: 5000 }),
      deduction: faker.number.int({ min: 1000, max: 5000 }),
      leave_encashment: faker.number.int({ min: 1000, max: 5000 }),
      net_pay: faker.number.int({ min: 1000, max: 5000 }),
      note: faker.lorem.words(5),
      employee_id: employeeId,
    });
  }

  return employeeExits;
}

export function seedEmployeeAccidents(employeeId: string) {
  const employeeAccidents: IncidentsDatabaseInsert[] = [];

  for (let i = 0; i < faker.number.int({ min: 0, max: 2 }); i++) {
    employeeAccidents.push({
      employee_id: employeeId,
      category:
        categoryOfIncidentArray[
          faker.number.int({ min: 0, max: categoryOfIncidentArray.length - 1 })
        ],
      date: faker.date.past().toISOString(),
      description: faker.lorem.words(5),
      location: faker.location.streetAddress(),
      location_type: locationTypeArray[faker.number.int({ min: 0, max: 1 })],
      medical_diagnosis: faker.lorem.words(5),
      severity: severityTypeArray[faker.number.int({ min: 0, max: 1 })],
      status:
        statusArray[faker.number.int({ min: 0, max: statusArray.length - 1 })],
      title: faker.lorem.words(5),
    });
  }

  return employeeAccidents;
}

export function seedEmployeeCases(caseData: Partial<CasesDatabaseRow>) {
  const employeeCases: Omit<CasesDatabaseInsert, "company_id">[] = [];

  for (let i = 0; i < faker.number.int({ min: 0, max: 3 }); i++) {
    employeeCases.push({
      title: faker.lorem.sentence(),
      amount_given: faker.number.int({ min: 1000, max: 5000 }),
      amount_received: faker.number.int({ min: 1000, max: 5000 }),
      case_type:
        caseTypeArray[
          faker.number.int({ min: 0, max: caseTypeArray.length - 1 })
        ],
      status:
        caseStatusArray[
          faker.number.int({ min: 0, max: caseStatusArray.length - 1 })
        ],
      court_case_reference: faker.string.alphanumeric(10),
      date: faker.date.past().toISOString(),
      incident_date: faker.date.past().toISOString(),
      description: faker.lorem.paragraph(),
      location: faker.location.streetAddress(),
      location_type:
        caseLocationTypeArray[faker.number.int({ min: 0, max: 1 })],
      resolution_date: faker.date.future().toISOString(),
      ...caseData,
    });
  }

  return employeeCases;
}
