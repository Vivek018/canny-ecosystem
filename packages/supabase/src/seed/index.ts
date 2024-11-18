import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import {
  createCompany,
  createEmployee,
  createEmployeeSkill,
  createEmployeeWorkHistory,
  createLocation,
  createProject,
  createRelationship,
  createSite,
} from "../mutations";
import {
  seedCompany,
  seedCompanyLocations,
  seedCompanyRegistrationDetails,
  seedCompanyRelationships,
} from "./companies";
import { seedProject, seedProjectSite } from "./projects";
import {
  seedEmployeeAddresses,
  seedEmployeeBankDetails,
  seedEmployeeGuardianDetails,
  seedEmployeeProjectAssignmentDetails,
  seedEmployees,
  seedEmployeeSkills,
  seedEmployeeStatutoryDetails,
  seedEmployeeWorkHistory,
} from "./employees";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function seed() {
  console.log("Seeding database...");
  const site_ids: string[] = [];

  console.time("Database has been seeded");

  console.time("Created Companies...");
  for (let index = 0; index < Math.floor((Math.random() + 1) * 10); index++) {
    const { id: companyId } = await createCompany({
      supabase,
      companyData: seedCompany(),
      companyRegistrationDetails: seedCompanyRegistrationDetails(),
      bypassAuth: true,
    });

    console.time("Created Locations and Relationships...");
    for (let index = 0; index < Math.floor((Math.random() + 1) * 20); index++) {
      await createLocation({
        supabase,
        data: { ...seedCompanyLocations(), company_id: companyId },
        bypassAuth: true,
      });

      await createRelationship({
        supabase,
        data: {
          ...seedCompanyRelationships(),
          parent_company_id: companyId!,
        },
        bypassAuth: true,
      });
    }
    console.timeEnd("Created Locations and Relationships...");

    console.time("Created Project and Sites...");
    for (let index = 0; index < Math.floor((Math.random() + 1) * 5); index++) {
      const { id: projectId } = await createProject({
        supabase,
        data: { ...seedProject(), project_client_id: companyId! },
        bypassAuth: true,
      });

      for (
        let index = 0;
        index < Math.floor((Math.random() + 1) * 10);
        index++
      ) {
        const { data } = await createSite({
          supabase,
          data: {
            ...seedProjectSite(),
            project_id: projectId!,
          },
          bypassAuth: true,
        });
        if (data?.id) {
          site_ids.push(data?.id);
        }
      }
    }
    console.timeEnd("Created Project and Sites...");

    console.time("Created Employees...");
    for (let index = 0; index < Math.floor((Math.random() + 1) * 30); index++) {
      const { data } = await createEmployee({
        supabase,
        employeeData: { ...seedEmployees(), company_id: companyId! },
        employeeStatutoryDetailsData: seedEmployeeStatutoryDetails(),
        employeeBankDetailsData: seedEmployeeBankDetails(),
        employeeProjectAssignmentData: {
          project_site_id:
            site_ids[Math.floor(Math.random() * site_ids.length)],
          ...seedEmployeeProjectAssignmentDetails(),
        },
        employeeAddressesData: seedEmployeeAddresses(),
        employeeGuardiansData: seedEmployeeGuardianDetails(),
        bypassAuth: true,
      });

      if (data?.id) {
        for (
          let index = 0;
          index < Math.floor((Math.random() + 1) * 3);
          index++
        ) {
          await createEmployeeWorkHistory({
            supabase,
            data: {
              employee_id: data.id,
              ...seedEmployeeWorkHistory(),
            },
            bypassAuth: true,
          });
        }
        for (
          let index = 0;
          index < Math.floor((Math.random() + 1) * 2);
          index++
        ) {
          await createEmployeeSkill({
            supabase,
            data: {
              employee_id: data.id,
              ...seedEmployeeSkills(),
            },
            bypassAuth: true,
          });
        }
      }
    }
    console.timeEnd("Created Employees...");
  }
  console.timeEnd("Created Companies...");

  console.timeEnd("Database has been seeded");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
