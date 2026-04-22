import React from "react";
import "../../assets/styles/Pagination.css"

const Pagination = ({
  totalItems = 0,
  itemsPerPage = 10,
  currentPage = 1,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = [5, 10, 20, 50],
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  const renderPages = () => {
    let pages = [];

    for (let i = 1; i <= totalPages; i++) {
      // limit visible pages (optional logic)
      if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
        pages.push(
          <button
            key={i}
            className={`pagination-page ${i === currentPage ? "active" : ""}`}
            onClick={() => goToPage(i)}
          >
            {i}
          </button>,
        );
      }
    }

    return pages;
  };

  return (
    <div className="pagination-container">
      {/* Left side: per page selector */}
      <div className="pagination-left">
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="pagination-select"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
      </div>

      {/* Middle: pages */}
      <div className="pagination-pages">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-arrow"
        >
          ◀
        </button>

        {renderPages()}

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-arrow"
        >
          ▶
        </button>
      </div>

      {/* Right side: range */}
      <div className="pagination-right">
        {start}-{end} of {totalItems}
      </div>
    </div>
  );
};

export default Pagination;
