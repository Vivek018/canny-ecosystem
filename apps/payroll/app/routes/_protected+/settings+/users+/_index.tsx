import { columns } from "@/components/user/table/columns";
import { UserDataTable } from "@/components/user/table/data-table";
import { safeRedirect } from "@/utils/server/http.server";
import { getSessionUser } from "@canny_ecosystem/supabase/cached-queries";
import { deleteUserById } from "@canny_ecosystem/supabase/mutations";

import {
  getUserByEmail,
  getUsers,
  type UserDataType,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { isGoodStatus } from "@canny_ecosystem/utils";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, Link, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const { data, error } = await getUsers({ supabase });

  if (error || !data) {
    throw error;
  }

  return json({ data });
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const Id = formData.get("id");
  if (!Id || typeof Id !== "string") {
    return json(
      { error: "User ID is required and must be a string" },
      { status: 400 }
    );
  }

  let sameUserLogout = false;
  const { user: sessionUser } = await getSessionUser({ request });
  const { data: dbUser } = await getUserByEmail({
    supabase,
    email: sessionUser?.email ?? "",
  });

  const { error, status } = await deleteUserById({ supabase, id: Id });

  if (dbUser?.id === Id) {
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.error("Error logging out:", signOutError);
      return safeRedirect("/setting/users", { headers });
    }
    sameUserLogout = true;
  }

  if (isGoodStatus(status) && sameUserLogout) {
    return safeRedirect("/login", { headers });
  }
  
  if (isGoodStatus(status)) {
    return safeRedirect("/settings/users", { headers });
  }

  return json({ error: error?.toString() }, { status: 500 });
}

export default function Users() {
  const { data } = useLoaderData<typeof loader>();
  const [searchString, setSearchString] = useState("");
  const [tableData, setTableData] = useState(data);

  useEffect(() => {
    const filteredData = data?.filter((item: UserDataType) =>
      Object.values(item).some((value) =>
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
              "flex items-center gap-1"
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
