import type { VehiclesDatabaseRow } from "@canny_ecosystem/supabase/types";
import { Card } from "@canny_ecosystem/ui/card";
import { formatDate, replaceUnderscore } from "@canny_ecosystem/utils";

type DetailItemProps = {
  label: string;
  value: string | number | null | undefined | any;
};

export const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => {
  return (
    <div className="flex flex-col items-start">
      <h3 className="text-muted-foreground text-[13px] tracking-wide capitalize">
        {label}
      </h3>
      <p>{value ?? "--"}</p>
    </div>
  );
};

export const VehicleDetailsCard: React.FC<{
  vehicle: Omit<VehiclesDatabaseRow, "created_at">;
}> = ({ vehicle }) => {
  return (
    <Card className="rounded w-full h-full p-4 flex flex-col gap-6">
      <h2 className="text-xl font-semibold">Vehicle Details</h2>
      {vehicle ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <DetailItem label="Name" value={vehicle?.name} />
          <DetailItem
            label="Registration Number"
            value={vehicle?.registration_number}
          />
          <DetailItem label="OwnerShip" value={vehicle?.ownership} />
          <DetailItem
            label="Type"
            value={replaceUnderscore(vehicle.vehicle_type)}
          />
          <DetailItem label="Price" value={vehicle.price} />
          <DetailItem label="Monthly Rate" value={vehicle.monthly_rate} />
          <DetailItem
            label="Start Date"
            value={formatDate(vehicle.start_date)}
          />
          <DetailItem label="End Date" value={vehicle.end_date} />
        </div>
      ) : (
        <div className="text-center py-8">
          <p>No vehicle data available.</p>
        </div>
      )}
    </Card>
  );
};
