import { AppointmentLetter } from "@/components/employees/employee/letters/letter-templates/appointment-letter";
import { ExperienceLetter } from "@/components/employees/employee/letters/letter-templates/experience-letter";
import { NOCLetter } from "@/components/employees/employee/letters/letter-templates/noc-letter";
import { OfferLetter } from "@/components/employees/employee/letters/letter-templates/offer-letter";
import { RelievingLetter } from "@/components/employees/employee/letters/letter-templates/relieving-letter";
import { TerminationLetter } from "@/components/employees/employee/letters/letter-templates/termination-letter";
import { ErrorBoundary } from "@/components/error-boundary";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  getCompanyById,
  getDefaultTemplateIdByCompanyId,
  getEmployeeLetterWithEmployeeById,
  getPaymentTemplateBySiteId,
  getPaymentTemplateComponentsByTemplateId,
  getPrimaryLocationByCompanyId,
  getTemplateIdByEmployeeId,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type {
  CompanyDatabaseUpdate,
  LocationDatabaseRow,
} from "@canny_ecosystem/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@canny_ecosystem/ui/dialog";
import { EmployeeLetterTypesArray } from "@canny_ecosystem/utils";
import { PDFViewer } from "@react-pdf/renderer";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  json,
  useLoaderData,
  useNavigate,
  useParams,
} from "@remix-run/react";

export type CompanyInfoDataType = {
  data: Omit<CompanyDatabaseUpdate, "created_at" | "updated_at"> | null;
  locationData: Omit<LocationDatabaseRow, "created_at" | "updated_at"> | null;
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { employeeId, letterId } = params;
  const { supabase } = getSupabaseWithHeaders({ request });

  try {
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    const { data: employeeLetterData, error: employeeError } =
      await getEmployeeLetterWithEmployeeById({
        supabase,
        id: letterId ?? "",
      });

    if (employeeError) throw employeeError;

    const { data: companyData, error: companyError } = await getCompanyById({
      supabase,
      id: companyId,
    });
    if (companyError) throw companyError;

    const { data: companyLocationData, error: companyLocationError } =
      await getPrimaryLocationByCompanyId({
        supabase,
        companyId: companyId ?? "",
      });
    if (companyLocationError) throw companyLocationError;

    let templateId = null;

    let templateComponentData = null;
    let templateComponentError = null;
    let employeeSalaryData = null;
    if (
      employeeLetterData?.letter_type !== "termination_letter" &&
      employeeLetterData?.letter_type !== "relieving_letter" &&
      employeeLetterData?.letter_type !== "experience_letter"
    ) {
      const { data: templateAssignmentData, error: templateAssignmentError } =
        await getTemplateIdByEmployeeId({
          supabase,
          employeeId: employeeId ?? "",
        });

      templateId = templateAssignmentData?.template_id;

      if (!templateId || templateAssignmentError) {
        const { data } = await getPaymentTemplateBySiteId({
          supabase,
          site_id:
            employeeLetterData?.employees.employee_project_assignment
              .project_sites.id ?? "",
        });

        templateId = data?.template_id;
      }

      if (!templateId || templateAssignmentError) {
        const { data, error } = await getDefaultTemplateIdByCompanyId({
          supabase,
          companyId: companyId ?? "",
        });

        templateId = data?.id;
        if (error || !templateId) throw new Error("No template found");
      }

      ({ data: templateComponentData, error: templateComponentError } =
        await getPaymentTemplateComponentsByTemplateId({
          supabase,
          templateId: templateId ?? "",
        }));
      if (templateComponentError) throw templateComponentError;

      employeeSalaryData = templateComponentData?.reduce(
        (acc, curr) => {
          const category = curr.component_type;

          if (!acc[category]) {
            acc[category] = {};
          }

          if (
            curr.target_type === "payment_field" &&
            curr.payment_fields.name
          ) {
            const fieldName =
              curr.payment_fields.name + "".replaceAll(" ", "_");
            acc[category][fieldName] = curr.calculation_value ?? 0;
          } else {
            acc[category][curr.target_type] = curr.calculation_value ?? 0;
          }

          return acc;
        },
        {} as Record<string, Record<string, number>>,
      );
    }

    return json({
      employeeLetterData,
      employeeSalaryData,
      companyData: {
        data: companyData,
        locationData: companyLocationData,
      },
      error: null,
    });
  } catch (error) {
    return json({
      error,
      employeeLetterData: null,
      employeeSalaryData: null,
      companyData: {
        data: null,
        locationData: null,
      },
    });
  }
}

export default function LetterPreview() {
  const { employeeLetterData, employeeSalaryData, companyData, error } =
    useLoaderData<typeof loader>();
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const generateLetter = (letterType?: string) => {
    switch (letterType) {
      case EmployeeLetterTypesArray[0]:
        return (
          <AppointmentLetter
            data={employeeLetterData}
            companyData={companyData}
            salaryData={employeeSalaryData}
          />
        );

      case EmployeeLetterTypesArray[1]:
        return (
          <ExperienceLetter
            data={employeeLetterData}
            companyData={companyData}
          />
        );

      case EmployeeLetterTypesArray[2]:
        return (
          <OfferLetter data={employeeLetterData} companyData={companyData} />
        );

      case EmployeeLetterTypesArray[3]:
        return (
          <NOCLetter data={employeeLetterData} companyData={companyData} />
        );

      case EmployeeLetterTypesArray[4]:
        return (
          <RelievingLetter
            data={employeeLetterData}
            companyData={companyData}
          />
        );

      case EmployeeLetterTypesArray[5]:
        return (
          <TerminationLetter
            data={employeeLetterData}
            companyData={companyData}
          />
        );

      default:
        return <></>;
    }
  };

  const handleOpenChange = () => {
    navigate(`/employees/${employeeId}/letters`);
  };

  if (error) {
    return <ErrorBoundary error={error} message="Failed to load letter" />;
  }

  return (
    <Dialog defaultOpen onOpenChange={handleOpenChange}>
      <DialogTitle />
      <DialogDescription className="text-muted-foreground" />
      <DialogContent disableIcon className="max-w-[60%] h-[90%]">
        <PDFViewer width="100%" height="100%">
          {generateLetter(employeeLetterData?.letter_type)}
        </PDFViewer>
      </DialogContent>
    </Dialog>
  );
}
