import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import {
  createCompany,
  createEmployee,
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
  seedEmployees,
  seedEmployeeStatutoryDetails,
} from "./employees";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

async function seed() {
  console.log("Seeding database...");

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
    for (let index = 0; index < Math.floor((Math.random() + 1) * 40); index++) {
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
    for (let index = 0; index < Math.floor((Math.random() + 1) * 20); index++) {
      const { id: projectId } = await createProject({
        supabase,
        data: { ...seedProject(), project_client_id: companyId! },
        bypassAuth: true,
      });

      for (
        let index = 0;
        index < Math.floor((Math.random() + 1) * 15);
        index++
      ) {
        await createSite({
          supabase,
          data: {
            ...seedProjectSite(),
            project_id: projectId!,
          },
          bypassAuth: true,
        });
      }
    }
    console.timeEnd("Created Project and Sites...");

    console.time("Created Employees...");
    for (
      let index = 0;
      index < Math.floor((Math.random() + 1) * 100);
      index++
    ) {
      await createEmployee({
        supabase,
        employeeData: { ...seedEmployees(), company_id: companyId! },
        employeeStatutoryDetailsData: seedEmployeeStatutoryDetails(),
        employeeBankDetailsData: seedEmployeeBankDetails(),
        employeeAddressesData: seedEmployeeAddresses(),
        employeeGuardiansData: seedEmployeeGuardianDetails(),
        bypassAuth: true,
      });
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
