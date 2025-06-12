import { Tabs, TabsContent, TabsTrigger, TabsList } from "@canny_ecosystem/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@canny_ecosystem/ui/table";
import { capitalizeFirstLetter, formatDate, pipe, replaceDash, replaceUnderscore } from "@canny_ecosystem/utils";


export const Results = ({
  results,
  columns,
  chartConfig,
}: {
  results: any[];
  columns: string[];
  chartConfig: any | null;
}) => {
  const formatColumnTitle = (title: string) => {
    return title
      .split("_")
      .map((word, index) =>
        index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word,
      )
      .join(" ");
  };

  const formatCellValue = (column: string, value: any) => {
    if (column.toLowerCase().includes("valuation")) {
      const parsedValue = Number.parseFloat(value);
      if (Number.isNaN(parsedValue)) {
        return "";
      }
      const formattedValue = parsedValue.toFixed(2);
      const trimmedValue = formattedValue.replace(/\.?0+$/, "");
      return `$${trimmedValue}B`;
    }
    if (column.toLowerCase().includes("rate")) {
      const parsedValue = Number.parseFloat(value);
      if (Number.isNaN(parsedValue)) {
        return "";
      }
      const percentage = (parsedValue * 100).toFixed(2);
      return `${percentage}%`;
    }
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    return String(value);
  };

  return (
    <div className="flex-grow flex flex-col overflow-hidden">
      <Tabs defaultValue="table" className="w-full flex-grow flex flex-col">
        <TabsList className="grid w-full grid-cols-2 rounded-none">
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
          <div className="sm:min-h-[10px] relative">
            <Table className="min-w-max divide-y divide-border">
              <TableHeader>
                <TableRow>
                  {columns.map((column, index) => (
                    <TableHead
                      key={index.toString()}
                      className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-max"
                    >
                      {pipe(formatColumnTitle, formatDate, replaceDash, replaceUnderscore, capitalizeFirstLetter)(column)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="bg-card border-b-2">
                {results.map((company, index) => (
                  <>
                    <TableRow key={index.toString()}>
                      {columns.map((column, cellIndex) => (
                        <TableCell
                          key={cellIndex.toString()}
                          className="px-6 py-4 whitespace-nowrap text-sm text-foreground"
                        >
                          {pipe(formatDate, replaceDash, replaceUnderscore)(formatCellValue(
                            column,
                            company[column],
                          ))}
                        </TableCell>
                      ))}
                    </TableRow>
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="charts" className="flex-grow overflow-auto">
          <div className="mt-4">
            {/* {chartConfig && results.length > 0 ? (
              <DynamicChart chartData={results} chartConfig={chartConfig} />
            ) : (
              <SkeletonCard />
            )} */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
