// import { getUser } from "@midday/supabase/cached-queries";
import { Avatar, AvatarFallback } from "@canny_ecosystem/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { Logout } from "./auth/logout";
import type { UserDatabaseRow } from "@canny_ecosystem/supabase/types";
import { cn } from "@canny_ecosystem/ui/utils/cn";

export function UserMenu({
  userData,
  isExpanded,
  dropdownContentRef,
  Link,
}: {
  userData: Omit<UserDatabaseRow, "created_at" | "updated_at">;
  isExpanded?: boolean;
  dropdownContentRef?: React.RefObject<HTMLDivElement>;
  Link: React.ElementType;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center justify-start gap-2 rounded group focus:outline-none focus:dark:brightness-150 hover:dark:brightness-150 focus:brightness-90 hover:brightness-90">
        <Avatar className="w-12 h-12 cursor-pointer">
          {userData?.avatar && (
            <img
              src={userData?.avatar}
              alt={userData?.first_name + userData?.last_name}
              width={32}
              height={32}
            />
          )}
          <AvatarFallback>
            <span className="text-xs">
              {userData?.first_name?.charAt(0)?.toUpperCase()}
            </span>
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            "flex flex-col items-start group-hover:opacity-70 group-hover:dark:opacity-100 gap-0.5",
            !isExpanded && "hidden"
          )}
        >
          <span className="truncate">
            {`${userData.first_name} ${userData.last_name}`}
          </span>
          <span className="truncate text-xs text-[#606060] font-normal">
            {userData.email}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        ref={dropdownContentRef}
        className="w-[240px]"
        align="start"
      >
        <>
          <DropdownMenuLabel>
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="truncate">
                  {`${userData.first_name} ${userData.last_name}`}
                </span>
                <span className="truncate text-xs text-[#606060] font-normal">
                  {userData.email}
                </span>
              </div>
              <div className="border py-0.5 px-3 rounded-full text-[11px] font-normal">
                Beta
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <Link prefetch="render" to="/account">
              <DropdownMenuItem>Account</DropdownMenuItem>
            </Link>
            <Link prefetch="render" to="/account/help">
              <DropdownMenuItem>Help</DropdownMenuItem>
            </Link>
            <Link prefetch="render" to="/account/feedback-form">
              <DropdownMenuItem>Feedback Form</DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
        </>

        <DropdownMenuSeparator />

        <Logout />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
