import type { CardInfoData } from "@/routes/_protected+/dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";

export function PayrollInfoCard({ cardData }: { cardData: CardInfoData }) {
  return (
    <Card className="text-xl">
      <CardHeader>Payroll Information</CardHeader>
      <CardContent className="flex justify-between">
        <CardTitle>Total Employees</CardTitle>
        <CardDescription className="text-lg">
          {cardData.totalEmployees ?? "--"}
        </CardDescription>
      </CardContent>
      <CardContent className="flex justify-between">
        <CardTitle>Total Projects</CardTitle>
        <CardDescription className="text-lg">
          {cardData.totalProjects ?? "--"}
        </CardDescription>
      </CardContent>
      <CardContent className="flex justify-between">
        <CardTitle>Total Sites</CardTitle>
        <CardDescription className="text-lg">
          {cardData?.totalSites ?? "--"}
        </CardDescription>
      </CardContent>
      <CardContent className="flex justify-between">
        <CardTitle>Total Locations</CardTitle>
        <CardDescription className="text-lg">
          {cardData.totalLocations ?? "--"}
        </CardDescription>
      </CardContent>
      <CardContent className="flex justify-between">
        <CardTitle>Total Users</CardTitle>
        <CardDescription className="text-lg">
          {cardData.totalUsers ?? "--"}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
