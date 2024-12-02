import { getSessionUser } from "@canny_ecosystem/supabase/cached-queries";
import { getUserByEmail } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { UserName } from "@/components/accounts/user-name";
import { UserContact } from "@/components/accounts/user-contact";
import { useEffect, useState } from "react";
import { UserAvatar } from "@/components/accounts/user-avatar";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const { user } = await getSessionUser({ request });
  const userEmail = user?.email;

  let userData = null;
  if (userEmail) {
    const { data, error } = await getUserByEmail({
      supabase,
      email: userEmail,
    });

    if (error || !data) {
      throw error;
    }

    userData = data;
  }

  return json({ data: userData });
}

export default function Accountindex() {
  const { data } = useLoaderData<typeof loader>();
  const [resetKey, setResetKey] = useState(Date.now());
  const userId = data?.id!;

  useEffect(() => {
    setResetKey(Date.now());
  }, [data]);

  return (
    <section className="flex flex-col gap-6 w-full lg:w-2/3 my-4">
      <UserAvatar
        avatar={data?.avatar ?? ""}
        first_name={data?.first_name ?? ""}
      />
      <UserName key={userId + resetKey} updateValues={data} />
      <UserContact key={userId + resetKey + 1} updateValues={data} />
    </section>
  );
}
