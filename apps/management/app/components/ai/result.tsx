import { useState, useMemo } from "react";
import {
  Tabs,
  TabsContent,
  TabsTrigger,
  TabsList,
} from "@canny_ecosystem/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@canny_ecosystem/ui/table";
import { DynamicChart } from "@canny_ecosystem/ui/dynamic-charts";
import {
  formatDate,
  pipe,
  replaceDash,
  replaceUnderscore,
} from "@canny_ecosystem/utils";
import { Icon } from "@canny_ecosystem/ui/icon";

export const Results = ({
  results,
  columns,
  chartConfig,
}: {
  results: any[];
  columns: string[];
  chartConfig: any | null;
}) => {
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const sortedResults = useMemo(() => {
    if (!sortBy) return results;

    return [...results].sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];

      if (valA == null && valB == null) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;

      const aStr = typeof valA === "string" ? valA.toLowerCase() : valA;
      const bStr = typeof valB === "string" ? valB.toLowerCase() : valB;

      if (aStr < bStr) return sortDirection === "asc" ? -1 : 1;
      if (aStr > bStr) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [results, sortBy, sortDirection]);

  return (
    <div className="flex-grow flex flex-col overflow-hidden">
      <Tabs defaultValue="table" className="w-full flex-grow flex flex-col">
        <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger
            value="charts"
            disabled={
              Object.keys(results[0] || {}).length <= 1 || results.length < 2
            }
          >
            Chart
          </TabsTrigger>
        </TabsList>
        <TabsContent value="table" className="flex-grow mt-0">
          <div className="sm:min-h-[10px] relative overflow-auto">
            <Table className="min-w-max divide-y divide-border">
              <TableHeader>
                <TableRow>
                  {columns.map((column, index) => (
                    <TableHead
                      key={index.toString()}
                      className="px-6 pt-5 pb-4 text-left text-xs font-medium text-muted-foreground/80 uppercase tracking-wider w-max cursor-pointer"
                      onClick={() => handleSort(column)}
                    >
                      {pipe(
                        formatDate,
                        replaceDash,
                        replaceUnderscore,
                      )(column)}
                      {sortBy === column ? (
                        <Icon name={sortDirection === "desc" ? "chevron-down" : "chevron-up"} size="xs" className="ml-1.5 -mt-1" />
                      ) : (
                        ""
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="bg-card border-b-2">
                {sortedResults.map((row, index) => (
                  <TableRow key={index.toString()}>
                    {columns.map((column, cellIndex) => (
                      <TableCell
                        key={cellIndex.toString()}
                        className="px-6 py-4 whitespace-nowrap text-sm text-foreground"
                      >
                        {pipe(
                          formatDate,
                          replaceDash,
                          replaceUnderscore,
                        )(row[column] !== null && String(row[column]))}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="charts" className="flex-grow overflow-auto">
          <div className="mt-4 px-4">
            {chartConfig && results.length > 0 ? (
              <DynamicChart chartData={results} chartConfig={chartConfig} />
            ) : <>F</>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
