"use client";

import { usePathname } from "next/navigation";

export default function Pagination1({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 20,
  onPageChange = () => { },
  maxVisiblePages = 5
}) {
  const path = usePathname();

  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Calculate start and end item numbers for display
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= maxVisiblePages + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

      // Adjust start if we're near the end
      if (endPage === totalPages - 1) {
        startPage = Math.max(2, endPage - maxVisiblePages + 1);
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('...');
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageClick = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Don't render pagination if there are no items
  if (totalItems === 0) {
    return null;
  }

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={`mbp_pagination text-center ${path === "/blog-2" || path === "/blog-3" ? "mb40-md" : ""
        } ${path === "/shop-list" ? "mt30" : ""}`}
    >
      <ul className="page_navigation">
        {/* Previous Button */}
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <a
            className="page-link"
            onClick={() => handlePageClick(currentPage - 1)}
            style={{ cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
          >
            <span className="fas fa-angle-left" />
          </a>
        </li>

        {/* Page Numbers */}
        {pageNumbers.map((page, index) => (
          <li
            key={index}
            className={`page-item ${page === currentPage ? "active" : ""
              } ${page === '...' ? "disabled" : ""}`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            <a
              className="page-link"
              onClick={() => page !== '...' && handlePageClick(page)}
              style={{ cursor: page === '...' ? "default" : "pointer" }}
            >
              {page}
              {page === currentPage && <span className="sr-only">(current)</span>}
            </a>
          </li>
        ))}

        {/* Next Button */}
        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
          <a
            className="page-link"
            onClick={() => handlePageClick(currentPage + 1)}
            style={{ cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
          >
            <span className="fas fa-angle-right" />
          </a>
        </li>
      </ul>

      <p className="mt10 mb-0 pagination_page_count text-center">
        {startItem} – {endItem} of {totalItems}+
      </p>
    </div>
  );
}