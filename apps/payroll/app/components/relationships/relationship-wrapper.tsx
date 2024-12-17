import { CommandItem } from "@canny_ecosystem/ui/command";
import { RelationshipCard } from "./relationship-card";
import { useEffect } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import type { RelationshipWithCompany } from "@canny_ecosystem/supabase/queries";

export function RelationshipWrapper({
  data,
  error,
}: {
  data: Omit<RelationshipWithCompany, "created_at" | "updated_at">[] | null;
  error: Error | null | { message: string };
}) {
  const { toast } = useToast();

  useEffect(() => {
    if(error) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load",
        variant: "destructive",
      });
    }
  }, [error]);

  return (
    <div className="w-full grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {data?.map((relationship) => (
        <CommandItem
          key={relationship?.id}
          value={
            relationship?.relationship_type +
            relationship?.parent_company?.name +
            relationship?.child_company?.name
          }
          className="data-[selected=true]:bg-inherit data-[selected=true]:text-foreground px-0 py-0"
        >
          <RelationshipCard relationship={relationship} />
        </CommandItem>
      ))}
    </div>
  );
}
