import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Area,
  AreaChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Label,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./chart";
import {
  formatDate,
  pipe,
  replaceDash,
  replaceUnderscore,
} from "@canny_ecosystem/utils";
import { transformDataForMultiLineChart } from "@/utils/rechart-format";

const colors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function DynamicChart({
  chartData,
  chartConfig,
}: {
  chartData: any[];
  chartConfig: any;
}) {
  if (!chartData || !chartConfig) return <div>No chart data</div>;

  const parsedChartData = chartData.map((item) => {
    const parsedItem: { [key: string]: any } = {};
    for (const [key, value] of Object.entries(item)) {
      parsedItem[key] = Number.isNaN(Number(value)) ? value : Number(value);
    }
    return parsedItem;
  });

  const groupedData = (data: any[]) => {
    const { xKey, yKeys } = chartConfig;
    const groups: Record<string, Record<string, number>> = {};
    for (const row of data) {
      const groupKey = row[xKey];
      if (!groups[groupKey]) {
        groups[groupKey] = {};
        for (const key of yKeys) {
          groups[groupKey][key] = 0;
        }
      }
      for (const key of yKeys) {
        const val = row[key];
        groups[groupKey][key] += typeof val === "number" ? val : 1;
      }
    }
    return Object.entries(groups).map(([group, values]) => ({
      [xKey]: group,
      ...values,
    }));
  };

  const chartDataGrouped = groupedData(parsedChartData);

  const processChartData = (data: any[], chartType: string) => {
    if (["bar", "pie"].includes(chartType) && data.length > 20) {
      return data.slice(0, 20);
    }
    return data;
  };

  const data = processChartData(chartDataGrouped, chartConfig.type);

  const xLabel = pipe(formatDate, replaceDash, replaceUnderscore)(chartConfig.xKey)!;
  const yLabel = pipe(formatDate, replaceDash, replaceUnderscore)(chartConfig.yKeys[0])!;

  const formatter = pipe(formatDate, replaceDash, replaceUnderscore) as any;

  const renderChart = () => {
    switch (chartConfig.type) {
      case "bar":
        return (
          <BarChart data={data} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={chartConfig.xKey}
              tickFormatter={formatter}
              textAnchor="end"
            >
              <Label value={xLabel} offset={-10} position="insideBottom" />
            </XAxis>
            <YAxis tickFormatter={formatter}>
              <Label value={yLabel} offset={-20} angle={-90} position="insideLeft" />
            </YAxis>
            <ChartTooltip content={<ChartTooltipContent labelFormatter={formatter} />} />
            {chartConfig.yKeys.map((key: string, i: number) => (
              <Bar key={key} dataKey={key} fill={colors[i % colors.length]} />
            ))}
          </BarChart>
        );
      case "line": {
        const { data: multiData, lineFields } = transformDataForMultiLineChart(
          data,
          chartConfig,
        );
        const useTransformedData =
          chartConfig.multipleLines &&
          chartConfig.measurementColumn &&
          chartConfig.yKeys.includes(chartConfig.measurementColumn);
        const usedData = useTransformedData ? multiData : data;

        return (
          <LineChart data={usedData} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={chartConfig.xKey}
              tickFormatter={formatter}
              angle={-30}
              textAnchor="end"
              height={70}
            >
              <Label value={xLabel} offset={-10} position="insideBottom" />
            </XAxis>
            <YAxis>
              <Label value={yLabel} angle={-90} position="insideLeft" />
            </YAxis>
            <ChartTooltip content={<ChartTooltipContent labelFormatter={formatter} />} />
            {(useTransformedData ? lineFields : chartConfig.yKeys).map(
              (key: string, index: number) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                />
              ),
            )}
          </LineChart>
        );
      }
      case "area":
        return (
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={chartConfig.xKey}
              tickFormatter={formatter}
              angle={-30}
              textAnchor="end"
              height={70}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent labelFormatter={formatter} />} />
            {chartConfig.yKeys.map((key: string, index: number) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                fill={colors[index % colors.length]}
                stroke={colors[index % colors.length]}
              />
            ))}
          </AreaChart>
        );
      case "pie":
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={chartConfig.yKeys[0]}
              nameKey={chartConfig.xKey}
              cx="50%"
              cy="50%"
              outerRadius={120}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index.toString()}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent labelFormatter={formatter} />} />
          </PieChart>
        );
      default:
        return <div>Unsupported chart type: {chartConfig.type}</div>;
    }
  };

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <h2 className="text-lg font-bold mb-2 text-center">{chartConfig.title}</h2>
      {chartConfig && data.length > 0 && (
        <ChartContainer
          config={chartConfig.yKeys.reduce((acc: any, key: string, i: number) => {
            acc[key] = {
              label: key,
              color: colors[i % colors.length],
            };
            return acc;
          }, {})}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </ChartContainer>
      )}
      <div className="w-full py-6 space-y-4">
        {chartConfig.description && (
          <p className="text-sm text-foreground/80 leading-relaxed tracking-wide">
            {chartConfig.description}
          </p>
        )}
        {chartConfig.takeaway && (
          <p className="text-sm text-foreground/80 leading-relaxed tracking-wide">
            {chartConfig.takeaway}
          </p>
        )}
      </div>
    </div>
  );
}
