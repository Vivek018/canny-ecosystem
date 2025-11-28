import { AppointmentLetter } from "@/components/employees/employee/letters/letter-templates/appointment-letter";
import { ContractualAppointmentLetter } from "@/components/employees/employee/letters/letter-templates/contractual-appointment-letter";
import { ExperienceLetter } from "@/components/employees/employee/letters/letter-templates/experience-letter";
import { NOCLetter } from "@/components/employees/employee/letters/letter-templates/noc-letter";
import { OfferLetter } from "@/components/employees/employee/letters/letter-templates/offer-letter";
import { RelievingLetter } from "@/components/employees/employee/letters/letter-templates/relieving-letter";
import { TerminationLetter } from "@/components/employees/employee/letters/letter-templates/termination-letter";
import { ErrorBoundary } from "@/components/error-boundary";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  getCompanyById,
  getDefaultEmployeeAddressesByEmployeeId,
  getEmployeeLetterWithEmployeeById,
  getPrimaryLocationByCompanyId,
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
import { employeeLetterTypesArray } from "@canny_ecosystem/utils";
import { PDFViewer } from "@react-pdf/renderer";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData, useNavigate, useParams } from "@remix-run/react";

export type CompanyInfoDataType = {
  data: Omit<CompanyDatabaseUpdate, "created_at"> | null;
  locationData: Omit<LocationDatabaseRow, "created_at"> | null;
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

    const { data: employeeAddressData } =
      await getDefaultEmployeeAddressesByEmployeeId({
        supabase,
        employeeId: employeeId ?? "",
      });

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

    return json({
      employeeLetterData,
      employeeAddressData,
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
      employeeAddressData: null,
      companyData: {
        data: null,
        locationData: null,
      },
    });
  }
}

export default function LetterPreview() {
  const { employeeLetterData, employeeAddressData, companyData, error } =
    useLoaderData<typeof loader>();

  const { employeeId } = useParams();
  const navigate = useNavigate();

  const generateLetter = (letterType?: string) => {
    switch (letterType) {
      case "appointment_letter":
        return (
          <AppointmentLetter
            data={employeeLetterData}
            employeeAddressData={employeeAddressData}
            companyData={companyData}
          />
        );

      case "experience_letter":
        return (
          <ExperienceLetter
            data={employeeLetterData}
            employeeAddressData={employeeAddressData}
            companyData={companyData}
          />
        );

      case "offer_letter":
        return (
          <OfferLetter
            data={employeeLetterData}
            employeeAddressData={employeeAddressData}
            companyData={companyData}
          />
        );

      case "noc_letter":
        return (
          <NOCLetter
            data={employeeLetterData}
            employeeAddressData={employeeAddressData}
            companyData={companyData}
          />
        );

      case "relieving_letter":
        return (
          <RelievingLetter
            data={employeeLetterData}
            employeeAddressData={employeeAddressData}
            companyData={companyData}
          />
        );

      case "termination_letter":
        return (
          <TerminationLetter
            data={employeeLetterData}
            employeeAddressData={employeeAddressData}
            companyData={companyData}
          />
        );

      case "contractual_appointment_letter":
        return (
          <ContractualAppointmentLetter
            data={employeeLetterData}
            employeeAddressData={employeeAddressData}
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
      <DialogContent
        disableIcon
        className="max-w-[60%] h-[90%] p-0 overflow-hidden"
      >
        <PDFViewer width="100%" height="100%">
          {generateLetter(employeeLetterData?.letter_type)}
        </PDFViewer>
      </DialogContent>
    </Dialog>
  );
}
