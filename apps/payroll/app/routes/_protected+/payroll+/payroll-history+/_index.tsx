import { ProjectCard } from "@/components/projects/project-card";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getProjectsByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@canny_ecosystem/ui/command";
import { useIsDocument } from "@canny_ecosystem/utils/hooks/is-document";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, Outlet, useLoaderData } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const { data, error } = await getProjectsByCompanyId({ supabase, companyId });

  if (error) throw error;

  return json({ data });
}

export default function ProjectsIndex() {
  const { data } = useLoaderData<typeof loader>();
  const { isDocument } = useIsDocument();

  return (
    <section className="py-4 px-4">
      <div className="w-full flex items-end justify-between">
        <Command className="overflow-visible">
          <div className="w-full lg:w-3/5 2xl:w-1/3 flex items-center gap-4">
            <CommandInput
              divClassName="border border-input rounded-md h-10 flex-1"
              placeholder="Search Projects"
              autoFocus={true}
            />
          </div>
          <CommandEmpty
            className={cn(
              "w-full py-40 capitalize text-lg tracking-wide text-center",
              !isDocument && "hidden",
            )}
          >
            No project found.
          </CommandEmpty>
          <CommandList className="max-h-full py-6 overflow-x-visible overflow-y-visible">
            <CommandGroup className="p-0 overflow-visible">
              <div className="w-full grid gap-8 grid-cols-1">
                {data?.map((project) => (
                  <CommandItem
                    key={project.id}
                    value={
                      project?.name +
                      project?.status +
                      project?.project_type +
                      project?.project_code +
                      project?.primary_contractor?.name +
                      project?.project_client?.name +
                      project?.end_client?.name
                    }
                    className="data-[selected=true]:bg-inherit data-[selected=true]:text-foreground px-0 py-0"
                  >
                    <ProjectCard project={project} />
                  </CommandItem>
                ))}
              </div>
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
      <Outlet />
    </section>
  );
}
