import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@canny_ecosystem/ui/avatar";
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
  userData: Omit<UserDatabaseRow, "created_at" >;
  isExpanded?: boolean;
  dropdownContentRef?: React.RefObject<HTMLDivElement>;
  Link: React.ElementType;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center justify-start gap-2 rounded group focus:outline-none focus:dark:brightness-125 hover:dark:brightness-125 focus:brightness-90 hover:brightness-90">
        <Avatar className="w-[47px] h-[48px] cursor-pointer">
          {userData?.avatar && (
            <AvatarImage
              src={userData?.avatar}
              alt={userData?.first_name + userData?.last_name}
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
            !isExpanded && "hidden",
          )}
        >
          <span className="truncate w-40 text-start">
            {`${userData.first_name} ${userData.last_name}`}
          </span>
          <span className="truncate w-40 text-start text-xs text-[#606060] font-normal">
            {userData.email}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        ref={dropdownContentRef}
        className="w-[280px]"
        align="start"
      >
        <>
          <DropdownMenuLabel>
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="w-36 truncate">
                  {`${userData.first_name} ${userData.last_name}`}
                </span>
                <span className="w-36 truncate text-xs text-[#606060] font-normal">
                  {userData.email}
                </span>
              </div>
              <div className="min-w-max border py-0.5 px-3 rounded-full text-[11px] font-normal flex-shrink-0">
                Beta
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <Link prefetch="intent" to="/user/account">
              <DropdownMenuItem>Account</DropdownMenuItem>
            </Link>
            <Link prefetch="intent" to="/user/help">
              <DropdownMenuItem>Help</DropdownMenuItem>
            </Link>
            <Link prefetch="intent" to="/user/feedback-form">
              <DropdownMenuItem>Feedback</DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
        </>

        <DropdownMenuSeparator />

        <Logout />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
