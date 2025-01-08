import { useReimbursementStore } from "@/store/reimbursements";
import { Button } from "@canny_ecosystem/ui/button";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";
import { Icon } from "@canny_ecosystem/ui/icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@canny_ecosystem/ui/popover";
import { cn } from "@canny_ecosystem/ui/utils/cn";

type ColumnType = {
  id: string;
  columnDef: {
    enableHiding?: boolean;
    header: string;
  };
  getIsVisible: () => boolean;
  toggleVisibility: (checked: boolean) => void;
};

export function ColumnVisibility({
  disabled,
  hidden,
}: { disabled?: boolean; hidden?: boolean }) {
  const { columns } = useReimbursementStore();

  return (
    <Popover>
      <PopoverTrigger asChild className={cn(hidden && "hidden")}>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10"
          disabled={disabled}
        >
          <Icon name="column" className="h-[18px] w-[18px]" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[200px] p-0" align="end" sideOffset={8}>
        <div className="flex flex-col p-4 space-y-3 max-h-[352px] overflow-auto">
          {columns
            .filter((column: any) => column?.columnDef?.enableHiding !== false)
            .map((column: any) => {
              return (
                <div key={column.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(checked) =>
                      column.toggleVisibility(checked)
                    }
                  />
                  <label
                    htmlFor={column.id}
                    className="text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {column.columnDef.header}
                  </label>
                </div>
              );
            })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
