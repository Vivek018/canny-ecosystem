import Papa from "papaparse";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@canny_ecosystem/ui/alert-dialog";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { formatDateTime } from "@canny_ecosystem/utils";
import type { SupabaseEnv } from "@canny_ecosystem/supabase/types";
import { Icon } from "@canny_ecosystem/ui/icon";
import { useSupabase } from "@canny_ecosystem/supabase/client";

const data = [
  {
    memberUAN: "100123456789",
    memberName: "John Smith",
    grossWages: 25000,
    epfWages: 15000,
    epsWages: 15000,
    edliWages: 15000,
    epfContributionEmployerShare: 1800,
    epsContribution: 1250,
    diffEPFandEPSContribution: 550,
    ncpDays: 0,
    refundOfAdvances: 0,
  },
  {
    memberUAN: "100987654321",
    memberName: "Jane Doe",
    grossWages: 35000,
    epfWages: 15000,
    epsWages: 15000,
    edliWages: 15000,
    epfContributionEmployerShare: 1800,
    epsContribution: 1250,
    diffEPFandEPSContribution: 550,
    ncpDays: 2,
    refundOfAdvances: 0,
  },
  {
    memberUAN: "100456789123",
    memberName: "Robert Johnson",
    grossWages: 42000,
    epfWages: 15000,
    epsWages: 15000,
    edliWages: 15000,
    epfContributionEmployerShare: 1800,
    epsContribution: 1250,
    diffEPFandEPSContribution: 550,
    ncpDays: 0,
    refundOfAdvances: 5000,
  },
  {
    memberUAN: "100789123456",
    memberName: "Sarah Williams",
    grossWages: 18000,
    epfWages: 15000,
    epsWages: 15000,
    edliWages: 15000,
    epfContributionEmployerShare: 1800,
    epsContribution: 1250,
    diffEPFandEPSContribution: 550,
    ncpDays: 5,
    refundOfAdvances: 0,
  },
  {
    memberUAN: "100234567891",
    memberName: "Michael Brown",
    grossWages: 28000,
    epfWages: 15000,
    epsWages: 15000,
    edliWages: 15000,
    epfContributionEmployerShare: 1800,
    epsContribution: 1250,
    diffEPFandEPSContribution: 550,
    ncpDays: 1,
    refundOfAdvances: 2000,
  },
];

export const DownloadEpfFormat = ({ env }: { env: SupabaseEnv }) => {
  const { supabase } = useSupabase({ env });

  const generateEpfFormat = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    const csv = Papa.unparse(data, { header: false }).replaceAll(",", "#~#");
    const blob = new Blob([csv], { type: "text" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;

    link.setAttribute("download", `Epf-Format - ${formatDateTime(Date.now())}`);

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className={cn(
          "w-full flex justify-start items-center gap-2"
        )}
      >
        <Icon name="import" />
        <p>Download Epf Format</p>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Epf Format</AlertDialogTitle>
          <AlertDialogDescription>
            Create the csv for Epf
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "ghost" }))}
            onClick={generateEpfFormat}
            onSelect={generateEpfFormat}
          >
            Create
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
