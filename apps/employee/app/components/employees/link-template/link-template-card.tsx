import { Card } from "@canny_ecosystem/ui/card";
import type { PaymentTemplateAssignmentsDatabaseRow } from "@canny_ecosystem/supabase/types";
import { formatDate } from "@canny_ecosystem/utils";

type DetailItemProps = {
  label: string;
  value: string | null | undefined;
};

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => {
  return (
    <div className="flex flex-col">
      <h3 className="text-muted-foreground text-[13px] tracking-wide capitalize">
        {label}
      </h3>
      <p>{value ?? "--"}</p>
    </div>
  );
};

export const LinkTemplateItem = ({
  paymentTemplateAssignmentData,
}: {
  paymentTemplateAssignmentData: Omit<
    PaymentTemplateAssignmentsDatabaseRow,
    "created_at"
  >;
}) => {
  return (
    <section className="w-full select-text cursor-auto h-full flex flex-col justify-start p-4">
      <ul className="grid grid-cols-3 max-sm:grid-cols-2 gap-4">
        <li>
          <DetailItem
            label="Template Name"
            value={paymentTemplateAssignmentData.name}
          />
        </li>
        <li>
          <DetailItem
            label="Assignment Type"
            value={paymentTemplateAssignmentData.assignment_type}
          />
        </li>
        <li>
          <DetailItem
            label="Effective From"
            value={formatDate(paymentTemplateAssignmentData.effective_from)}
          />
        </li>
        <li>
          <DetailItem
            label="Effective To"
            value={formatDate(paymentTemplateAssignmentData.effective_to)}
          />
        </li>
        <li>
          <DetailItem
            label="Is Active"
            value={paymentTemplateAssignmentData.is_active ? "Yes" : "No"}
          />
        </li>
      </ul>
    </section>
  );
};

export const LinkTemplateCard = ({
  paymentTemplateAssignmentData,
}: {
  paymentTemplateAssignmentData: Omit<
    PaymentTemplateAssignmentsDatabaseRow,
    "created_at"
  > | null;
}) => {
  return (
    <Card className="rounded w-full h-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Link Template</h2>
      </div>

      <div className="w-full overflow-scroll no-scrollbar">
        {paymentTemplateAssignmentData ? (
          <div className="flex items-center justify-between gap-4 min-w-max">
            <LinkTemplateItem
              paymentTemplateAssignmentData={paymentTemplateAssignmentData}
            />
          </div>
        ) : (
          <div className="text-center py-8">
            <p>No link template available</p>
          </div>
        )}
      </div>
    </Card>
  );
};
