import { ColumnVisibility } from "@/components/employees/column-visibility";
import { AddEmployeeDialog } from "./add-employee-dialog";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Link } from "@remix-run/react";
import { cn } from "@canny_ecosystem/ui/utils/cn";

export function EmployeesActions({
  isEmpty,
  emails,
}: {
  isEmpty: boolean;
  emails?: any[];
}) {
  // const { columnVisibility, selectedRows } = useEmployeesStore();
  return (
    <div className="gap-4 hidden md:flex">
      <div className="flex gap-2 px-4 border-r border-muted-foreground/80">
      <ColumnVisibility disabled={isEmpty} />
      {/* <EmployeesEmailMenu
        emails={emails}
        selectedRows={selectedRows}
        columnVisibility={columnVisibility}
      /> */}
      <AddEmployeeDialog />
      </div>
      <Link to="/chat/chatbox/employee" className={cn(buttonVariants({ variant: "gradiant" }), "flex items-center justify-center gap-2 h-10")}>
        <Icon name="magic" size="xs" />
        <p>AI Chat</p>
      </Link>
    </div>
  );
}
