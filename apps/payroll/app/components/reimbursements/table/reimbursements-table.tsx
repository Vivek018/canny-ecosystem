import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@canny_ecosystem/ui/table";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ReimbursementsTableHeader } from "./reimbursements-table-header";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import {
  getReimbursementsByCompanyId,
  getReimbursementsByEmployeeId,
} from "@canny_ecosystem/supabase/queries";
import { useSupabase } from "@canny_ecosystem/supabase/client";
import { Spinner } from "@canny_ecosystem/ui/spinner";

interface DataTableProps<TData, TValue> {
  
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  hasNextPage: boolean;
  pageSize: number;
  env: any;
  companyId?: string;
  employeeId?: string;
}

export function ReimbursementsTable<TData, TValue>({
  columns,
  data: initialData,
  hasNextPage: initialHasNextPage,
  pageSize,
  env,
  companyId,
  employeeId,
}: DataTableProps<TData, TValue>) {
  const [data, setData] = useState(initialData);
  const [from, setFrom] = useState(pageSize);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const { supabase } = useSupabase({ env });

  const { ref, inView } = useInView();

  const loadMoreEmployees = async () => {
    const formattedFrom = from;
    const to = formattedFrom + pageSize;
    if (companyId) {
      try {
        const { data } = await getReimbursementsByCompanyId({
          supabase,
          companyId,
          from,
          to,
          
        });
        if (data) {
          setData((prevData: any) => [...prevData, ...data] as TData[]);
        }
        setFrom(to + 1);
        setHasNextPage(data?.length! > to);
      } catch {
        setHasNextPage(false);
      }
    }
    if (employeeId) {
      try {
        const { data } = await getReimbursementsByEmployeeId({
          supabase,
          employeeId,
          from,
          to,
        });
        if (data) {
          setData(
            (prevData: any) => [...prevData, ...(data as any)] as TData[]
          );
        }
        setFrom(to + 1);
        setHasNextPage(data?.length! > to);
      } catch {
        setHasNextPage(false);
      }
    }
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    if (inView) {
      loadMoreEmployees();
    }
  }, [inView]);

  useEffect(() => {
    setData(initialData);
    setFrom(pageSize);
    setHasNextPage(initialHasNextPage);
  }, [initialData]);

  const tableLength = table.getRowModel().rows?.length;

  return (
    <div className="relative mb-8">
      <div
        className={cn(
          "relative border overflow-x-auto rounded",
          !tableLength && "border-none"
        )}
      >
        <div className="relative">
          <Table>
            <ReimbursementsTableHeader
              table={table}
              className={cn(!tableLength && "hidden")}
            />
            <TableBody>
              {tableLength ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="relative  cursor-default select-text"
                  >
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "px-3 md:px-4 py-4 hidden md:table-cell",
                            cell.column.id === "status" &&
                              (cell.getValue() === "approved"
                                ? "text-green"
                                : cell.getValue() === "pending" &&
                                  "text-muted-foreground")
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow className={cn(!tableLength && "border-none")}>
                  <TableCell
                    colSpan={columns.length}
                    className="h-80 bg-background grid place-items-center text-center tracking-wide text-xl capitalize"
                  >
                    No Reimbursement Fields Found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {hasNextPage && (
        <div className="flex items-center justify-center mt-6" ref={ref}>
          <div className="flex items-center space-x-2 px-6 py-5">
            <Spinner />
            <span className="text-sm text-[#606060]">Loading more...</span>
          </div>
        </div>
      )}
    </div>
  );
}
