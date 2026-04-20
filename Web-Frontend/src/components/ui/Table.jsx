/*

able
File: Table.jsx
Purpose: Display tabular data in rows and columns.
Use cases:
Tasks with due dates, assignee, status
Project lists
Activity logs
Why use it:
Consistent design and functionality
Can include sorting, selection, or pagination

Example:

<Table 
  columns={['Task', 'Due Date', 'Status']} 
*/

// jerry

import React, { useState } from "react";

const Table = ({ columns, data, actions }) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Filter and search
  const filteredData = data
    .filter((item) =>
      columns.some((col) =>
        item[col.accessor]
          .toString()
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    )
    .filter((item) => (filter ? item.status === filter : true));

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  return (
    <div className="table-container">
      {/* Search & Filter */}
      <div
        className="table-controls"
        style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}
      >
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.accessor}
                style={{
                  borderBottom: "1px solid #ccc",
                  padding: "0.5rem",
                  textAlign: "left",
                }}
              >
                {col.header}
              </th>
            ))}
            {actions && (
              <th style={{ borderBottom: "1px solid #ccc", padding: "0.5rem" }}>
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                style={{ textAlign: "center", padding: "1rem" }}
              >
                No data found
              </td>
            </tr>
          ) : (
            paginatedData.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                {columns.map((col) => (
                  <td key={col.accessor} style={{ padding: "0.5rem" }}>
                    {row[col.accessor]}
                  </td>
                ))}
                {actions && (
                  <td
                    style={{
                      padding: "0.5rem",
                      display: "flex",
                      gap: "0.5rem",
                    }}
                  >
                    {actions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => action.onClick(row)}
                      >
                        {action.label}
                      </button>
                    ))}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div
        style={{
          marginTop: "1rem",
          display: "flex",
          justifyContent: "center",
          gap: "0.5rem",
        }}
      >
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span>
          {currentPage} / {totalPages || 1}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Table;
