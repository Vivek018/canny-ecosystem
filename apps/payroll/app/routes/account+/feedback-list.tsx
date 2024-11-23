import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { safeRedirect } from "@/utils/server/http.server";
import {
  getCompanyById,
  getFeedbacksByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@canny_ecosystem/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@canny_ecosystem/ui/pagination";
import { formatDateTime } from "@canny_ecosystem/utils";

import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";

const LIMIT = 9;

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);

  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const { data: companyData, error: companyError } = await getCompanyById({
    supabase,
    id: companyId,
  });

  if (companyError || !companyData) {
    throw new Error("Company not found" + `${companyError}`);
  }

  if (companyData.company_type !== "app_creator") {
    return safeRedirect("/account/feedback-form");
  }

  const { data, error, totalCount } = await getFeedbacksByCompanyId({
    supabase,
    companyId,
    page,
    limit: LIMIT,
  });

  if (error) {
    console.error(error);
  }
  return json({ data, page, totalCount });
}

export default function FeedbackList() {
  const { data, page, totalCount } = useLoaderData<typeof loader>();

  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const totalPages = Math.ceil(totalCount / LIMIT);

  const handlePrevious = () => {
    if (currentPage > 1) {
      searchParams.set("page", `${currentPage - 1}`);
      setSearchParams(searchParams);
    }
  };

  const goToPage = (pageNum: number) => {
    searchParams.set("page", `${pageNum}`);
    setSearchParams(searchParams);
  };

  const getPaginationRange = (currentPage: number, totalPages: number) => {
    const range: (number | "...")[] = [];
    const maxVisiblePages = 3;

    range.push(1);

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 2; i < totalPages; i++) range.push(i);
    } else {
      if (currentPage > 3) range.push("..."); // CHANGED

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) range.push(i);

      if (currentPage < totalPages - 2) range.push("..."); //CHANGED
    }
    if (totalPages > 1) range.push(totalPages);

    return range;
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      searchParams.set("page", `${currentPage + 1}`);
      setSearchParams(searchParams);
    }
  };

  return (
    <section className="pt-4 flex flex-col">
      <div className="h-full flex flex-col w-full  flex-grow justify-between items-end">
        <div className="min-h-[700px] max-h-[700px] overflow-y-scroll w-full grid gap-6 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
          {data?.map((feedback) => (
            <Card
              key={feedback.id}
              className="w-full select-text cursor-auto dark:border-[1.5px] h-max flex flex-col justify-between"
            >
              <CardHeader className="flex flex-row space-y-0 items-center justify-between py-3">
                <CardTitle className="text-base tracking-wide">
                  {feedback.category}
                </CardTitle>
                <CardTitle
                  className={`text-base px-1 tracking-wide ${
                    feedback.severity === "urgent"
                      ? "text-red-600"
                      : feedback.severity === "normal"
                      ? "text-purple-500"
                      : "text-yellow-400"
                  }`}
                >
                  {feedback.severity}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col gap-0.5">
                <article className="py-2">
                  <h3 className="capitalize font-bold text-sm">
                    {feedback.subject}
                  </h3>
                  <p className="pt-2 capitalize text-xs break-words line-clamp-4">
                    {feedback.message}
                  </p>
                </article>
              </CardContent>

              <CardFooter className="flex-col items-center">
                <div className="w-full flex flex-shrink items-center justify-start">
                  <Avatar className="w-10 h-10 cursor-pointer">
                    {feedback.users?.avatar && (
                      <AvatarImage
                        src={feedback.users?.avatar}
                        alt={`${feedback.users?.first_name} ${feedback.users?.last_name}`}
                      />
                    )}
                    <AvatarFallback>
                      <span className="text-xs">
                        {feedback.users?.first_name?.charAt(0)?.toUpperCase()}
                      </span>
                    </AvatarFallback>
                  </Avatar>
                  <div className="w-full flex justify-between text-wrap items-center">
                    <div className="flex flex-col ml-3">
                      <span className="text-wrap">
                        {`${feedback.users.first_name} ${feedback.users.last_name}`}
                      </span>
                      <span className="truncate w-36 text-xs text-[#606060] font-normal">
                        {feedback.users.email}
                      </span>
                    </div>
                    <div className="ml-2 truncate text-xs text-[#606060] font-normal text-wrap">
                      {formatDateTime(feedback.created_at)}
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Pagination className="my-4">
          <PaginationContent>
            <PaginationItem className="mx-2">
              <PaginationPrevious
                size=""
                className={`cursor-pointer hover:text-primary px-3 ${
                  currentPage === 1 && "opacity-50 cursor-not-allowed"
                }`}
                onClick={handlePrevious}
              />
            </PaginationItem>
            {getPaginationRange(currentPage, totalPages).map(
              (pageNum, index) => {
                if (pageNum === "...") {
                  return (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis className="rotate-90" />
                    </PaginationItem>
                  );
                }
                return (
                  <PaginationItem key={pageNum} className="mx-0.5">
                    <PaginationLink
                      size=""
                      onClick={() => {
                        if (typeof pageNum === "number") {
                          goToPage(pageNum);
                        }
                      }}
                      isActive={currentPage === pageNum}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
            )}

            <PaginationItem className="mx-2">
              <PaginationNext
                size=""
                className={`cursor-pointer hover:text-primary px-3 ${
                  currentPage === totalPages && "opacity-50 cursor-not-allowed"
                }`}
                onClick={handleNext}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </section>
  );
}
