import { Button } from "@canny_ecosystem/ui/button";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { formatDateTime } from "@canny_ecosystem/utils";
import Papa from "papaparse";

export function ExportBar({
  rows,
  data,
  className,
}: {
  rows: number;
  data: any[];
  className: string;
}) {
  const toBeExportedData = data.map((element) => ({
    title: element?.title,
    description: element?.description,
    date: element?.date,
    case_type: element?.case_type,
    status: element?.status,
    incident_date: element?.incident_date,
    resolution_date: element?.resolution_date,
    location: element?.location,
    location_type: element?.location_type,
    reported_by: element?.reported_by,
    reported_on: element?.reported_on,
    amount_given: element?.amount_given,
    amount_received: element?.amount_received,
    court_case_reference: element?.court_case_reference,
    document: element?.document,
    reported_by_project: element?.reported_by_project?.name,
    reported_on_project: element?.reported_on_project?.name,
    reported_by_employee: element?.reported_by_employee?.employee_code,
    reported_on_employee: element?.reported_on_employee?.employee_code,
    reported_by_site: element?.reported_by_site?.name,
    reported_on_site: element?.reported_on_site?.name,
    reported_by_company: element?.reported_by_company?.name,
    reported_on_company: element?.reported_on_company?.name,
  }));

  const handleExport = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const csv = Papa.unparse(toBeExportedData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;

    link.setAttribute("download", `Cases - ${formatDateTime(Date.now())}`);

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  };

  return (
    <div
      className={cn(
        "z-40 fixed bottom-16 md:bottom-8 left-0 right-0 mx-auto h-14 w-max shadow-md rounded-full flex gap-10 justify-between items-center p-2 text-sm border dark:border-muted-foreground/30 bg-card text-card-foreground",
        className
      )}
    >
      <div className="ml-2 flex items-center space-x-1 rounded-md">
        <p className="font-semibold">{rows} Selected</p>
      </div>
      <div className="h-full flex justify-center items-center gap-2">
        <div className="h-full tracking-wide font-medium rounded-full hidden md:flex justify-between items-center px-6 border dark:border-muted-foreground/30 ">
          Open:{" "}
          <span className="ml-1.5">
            {data?.filter((item) => item?.status === "open")?.length ?? ""}
          </span>
        </div>
        <Button
          onClick={handleExport}
          variant="default"
          size="lg"
          className="h-full rounded-full"
        >
          Export
        </Button>
      </div>
    </div>
  );
}
