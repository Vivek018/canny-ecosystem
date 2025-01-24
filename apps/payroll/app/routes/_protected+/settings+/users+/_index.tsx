import { columns } from "@/components/user/table/columns";
import { UserDataTable } from "@/components/user/table/data-table";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { useUserRole } from "@/utils/user";

import { getUsersByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { hasPermission, updateRole } from "@canny_ecosystem/utils";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, Link, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  const { data, error } = await getUsersByCompanyId({ supabase, companyId });

  if (error || !data) {
    throw error;
  }

  return json({ data });
}

export default function Users() {
  const { role } = useUserRole();
  const { data } = useLoaderData<typeof loader>();
  const [searchString, setSearchString] = useState("");
  const [tableData, setTableData] = useState(data);

  useEffect(() => {
    const filteredData = data?.filter((item) =>
      Object.entries(item).some(
        ([key, value]) =>
          key !== "avatar" &&
          String(value).toLowerCase().includes(searchString.toLowerCase())
      )
    );

    setTableData(filteredData);
  }, [searchString, data]);

  return (
    <section className="py-4">
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
              placeholder="Search Users"
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
              className="pl-8 h-10 w-full focus-visible:ring-0"
            />
          </div>
          <Link
            to="/settings/users/create-user"
            className={cn(
              buttonVariants({ variant: "primary-outline" }),
              "flex items-center gap-1",
              !hasPermission(`${role}`, `${updateRole}:setting_users`) &&
                "hidden"
            )}
          >
            <span>Add</span>
            <span className="hidden md:flex justify-end">User</span>
          </Link>
        </div>
      </div>
      <UserDataTable data={tableData as any} columns={columns} />
    </section>
  );
}
