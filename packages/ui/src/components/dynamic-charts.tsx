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
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./chart";
import { Label } from "recharts";
import { transformDataForMultiLineChart } from "@/utils/rechart-format";
import { formatDate, pipe, replaceDash, replaceUnderscore } from "@canny_ecosystem/utils";


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
  const renderChart = () => {
    if (!chartData || !chartConfig) return <div>No chart data</div>;
    const parsedChartData = chartData.map((item) => {
      const parsedItem: { [key: string]: any } = {};
      for (const [key, value] of Object.entries(item)) {
        parsedItem[key] = Number.isNaN(Number(value)) ? value : Number(value);
      }
      return parsedItem;
    });

    chartData = parsedChartData;

    const processChartData = (data: any[], chartType: string) => {
      if (chartType === "bar" || chartType === "pie") {
        if (data.length <= 8) {
          return data;
        }

        const subset = data.slice(0, 20);
        return subset;
      }
      return data;
    };

    chartData = processChartData(chartData, chartConfig.type);

    switch (chartConfig.type) {
      case "bar":
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chartConfig.xKey}>
              <Label
                value={pipe(
                  formatDate,
                  replaceDash,
                  replaceUnderscore,
                )(chartConfig.xKey)!}
                offset={0}
                position="insideBottom"
              />
            </XAxis>
            <YAxis>
              <Label
                value={pipe(
                  formatDate,
                  replaceDash,
                  replaceUnderscore,
                )(chartConfig.yKeys[0])!}
                angle={-90}
                position="insideLeft"
              />
            </YAxis>
            <ChartTooltip content={<ChartTooltipContent />} />
            {chartConfig.legend && <Legend />}
            {chartConfig.yKeys.map((key: number, index: number) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
              />
            ))}
          </BarChart>
        );
      case "line": {
        const { data, xAxisField, lineFields } = transformDataForMultiLineChart(
          chartData,
          chartConfig,
        );
        const useTransformedData =
          chartConfig.multipleLines &&
          chartConfig.measurementColumn &&
          chartConfig.yKeys.includes(chartConfig.measurementColumn);
        return (
          <LineChart data={useTransformedData ? data : chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={useTransformedData ? chartConfig.xKey : chartConfig.xKey}
            >
              <Label
                value={pipe(
                  formatDate,
                  replaceDash,
                  replaceUnderscore,
                )(
                  useTransformedData ? xAxisField : chartConfig.xKey,
                )!}
                offset={0}
                position="insideBottom"
              />
            </XAxis>
            <YAxis>
              <Label
                value={pipe(
                  formatDate,
                  replaceDash,
                  replaceUnderscore,
                )(chartConfig.yKeys[0])!}
                angle={-90}
                position="insideLeft"
              />
            </YAxis>
            <ChartTooltip content={<ChartTooltipContent />} />
            {chartConfig.legend && <Legend />}
            {useTransformedData
              ? lineFields.map((key: string, index: number) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                />
              ))
              : chartConfig.yKeys.map((key: number, index: number) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                />
              ))}
          </LineChart>
        );
      }
      case "area":
        return (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chartConfig.xKey} />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            {chartConfig.legend && <Legend />}
            {chartConfig.yKeys.map((key: number, index: number) => (
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
              data={chartData}
              dataKey={chartConfig.yKeys[0]}
              nameKey={chartConfig.xKey}
              cx="50%"
              cy="50%"
              outerRadius={120}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index.toString()}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
            {chartConfig.legend && <Legend />}
          </PieChart>
        );
      default:
        return <div>Unsupported chart type: {chartConfig.type}</div>;
    }
  };

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <h2 className="text-lg font-bold mb-2">{chartConfig.title}</h2>
      {chartConfig && chartData.length > 0 && (
        <ChartContainer
          config={chartConfig.yKeys.reduce(
            (acc: any, key: number, index: number) => {
              acc[key] = {
                label: key,
                color: colors[index % colors.length],
              };
              return acc;
            },
            {} as Record<string, { label: string; color: string }>,
          )}
          className="h-[300px] w-full"
        >
          {renderChart()}
        </ChartContainer>
      )}
      <div className="w-full py-6">
        <p className="mt-4 text-foreground/80 tracking-wider">{chartConfig.description}</p>
        <p className="mt-4 text-foreground/80 tracking-wider">{chartConfig.takeaway}</p>
      </div>
    </div>
  );
}
