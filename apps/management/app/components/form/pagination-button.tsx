import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@canny_ecosystem/ui/pagination";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useSearchParams } from "@remix-run/react";

export default function PaginationButton({
  page,
  totalCount,
  limit,
}: {
  page: number;
  totalCount: number;
  limit: number;
}) {
  const currentPage = page ?? 1;
  const totalPages = Math.ceil(totalCount / limit);

  const [searchParams, setSearchParams] = useSearchParams();

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
      if (currentPage > 3) range.push("...");

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) range.push(i);

      if (currentPage < totalPages - 2) range.push("...");
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
    <Pagination className="mb-8 pt-6 mt-auto">
      <PaginationContent>
        <PaginationItem className="mx-2">
          <PaginationPrevious
            className={cn(
              "px-3",
              currentPage === 1 && "opacity-50 cursor-not-allowed",
            )}
            onClick={handlePrevious}
          />
        </PaginationItem>
        {getPaginationRange(currentPage, totalPages).map((pageNum, index) => {
          if (pageNum === "...") {
            return (
              <PaginationItem key={`ellipsis-${index.toString()}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }
          return (
            <PaginationItem key={pageNum} className="mx-0.5">
              <PaginationLink
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
        })}

        <PaginationItem className="mx-2">
          <PaginationNext
            className={cn(
              "px-3",
              currentPage === totalPages && "opacity-50 cursor-not-allowed",
            )}
            onClick={handleNext}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
