import { columns } from "@/components/payment-field/table/columns";
import { DataTable } from "@/components/payment-field/table/data-table";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  getPaymentFieldsByCompanyId,
  type PaymentFieldDataType,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, Link, useLoaderData } from "@remix-run/react";
import { Input } from "@canny_ecosystem/ui/input";
import { useEffect, useState } from "react";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { useToast } from "@canny_ecosystem/ui/use-toast";

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<Response> {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const { data, error } = await getPaymentFieldsByCompanyId({
      supabase,
      companyId,
    });

    if (error) {
      return json(
        { status: "error", message: error.message, error, data },
        { status: 500 },
      );
    }

    if (!data || data.length === 0) {
      return json({
        status: "info",
        message: "No payment fields found for this company",
        data,
      });
    }

    return json({
      status: "success",
      message: "Payment fields loaded successfully",
      data,
    });
  } catch (error) {
    return json(
      { status: "error", message: "Failed to load data", error },
      { status: 500 },
    );
  }
}

export default function PaymentFieldsIndex() {
  const { data, status, message } = useLoaderData<typeof loader>();

  const [searchString, setSearchString] = useState("");
  const [tableData, setTableData] = useState(data);
  const { toast } = useToast();

  useEffect(() => {
    if (status === "info" && message) {
      toast({
        title: "Info",
        description: message || "No data found",
      });
    }

    if (status === "error" && message)
      toast({
        title: "Error",
        description: message || "Failed to load",
      });
  }, [data]);

  useEffect(() => {
    const filteredData = data?.filter((item: PaymentFieldDataType) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchString.toLowerCase()),
      ),
    );
    setTableData(filteredData);
  }, [searchString, data]);

  return (
    <>
      <section className="p-4">
        <div className="w-full flex items-center justify-between pb-4">
          <div className="w-full lg:w-3/5 2xl:w-1/3 flex items-center gap-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Icon
                  name="magnifying-glass"
                  size="sm"
                  className="text-gray-400"
                />
              </div>
              <Input
                placeholder="Search Payment Fields"
                value={searchString}
                onChange={(e) => setSearchString(e.target.value)}
                className="pl-8 h-10 w-full focus-visible:ring-0"
              />
            </div>
            <Link
              to="/payment-components/payment-fields/create-payment-field"
              className={cn(
                buttonVariants({ variant: "primary-outline" }),
                "flex items-center gap-1",
              )}
            >
              <span>Add</span>
              <span className="hidden md:flex justify-end">Payment Field</span>
            </Link>
          </div>
        </div>
        <DataTable data={tableData ?? []} columns={columns} />
      </section>
    </>
  );
}
