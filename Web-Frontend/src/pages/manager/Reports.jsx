import { useMemo, useState } from "react";
import Button from "../../components/ui/Button";

// CSV and PDF export libraries
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // <- fixed import for modern usage

const mockReports = Array.from({ length: 32 }, (_, i) => ({
  id: i + 1,
  title: `Weekly Progress Report ${i + 1}`,
  staff: `Staff ${i + 1}`,
  department: ["Innovation", "Operations", "Finance", "HR"][i % 4],
  date: new Date(2026, 2, (i % 28) + 1),
  status: ["Pending", "Approved", "Rejected"][i % 3],
  content: "This is a detailed report submitted to the manager regarding weekly progress and project updates."
}));

const Reports = () => {
  const [reports, setReports] = useState(mockReports);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortNewest, setSortNewest] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filteredReports = useMemo(() => {
    let data = [...reports];

    if (search) {
      data = data.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.staff.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (departmentFilter !== "All") {
      data = data.filter(r => r.department === departmentFilter);
    }

    if (statusFilter !== "All") {
      data = data.filter(r => r.status === statusFilter);
    }

    data.sort((a, b) =>
      sortNewest
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date)
    );

    return data;
  }, [reports, search, departmentFilter, statusFilter, sortNewest]);

  const totalPages = Math.ceil(filteredReports.length / pageSize);
  const paginatedReports = filteredReports.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === "Pending").length,
    approved: reports.filter(r => r.status === "Approved").length,
    rejected: reports.filter(r => r.status === "Rejected").length,
  };

  const updateStatus = (id, newStatus) => {
    setReports(prev =>
      prev.map(r =>
        r.id === id ? { ...r, status: newStatus } : r
      )
    );
    setSelectedReport(null);
  };

  const statusClass = (status) => {
    if (status === "Approved") return "staff-badge staff-badge--success";
    if (status === "Rejected") return "staff-badge staff-badge--danger";
    return "staff-badge staff-badge--warning";
  };

  // Export CSV function
  const exportCSV = () => {
    const headers = ["ID", "Title", "Staff", "Department", "Date", "Status"];
    const rows = filteredReports.map(r => [
      r.id,
      r.title,
      r.staff,
      r.department,
      r.date.toLocaleDateString(),
      r.status
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reports.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF function (Fixed)
  const exportPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text("Staff Reports", 14, 15);

    // Table columns
    const tableColumn = ["ID", "Title", "Staff", "Department", "Date", "Status"];
    const tableRows = filteredReports.map(r => [
      r.id,
      r.title,
      r.staff,
      r.department,
      r.date.toLocaleDateString(),
      r.status
    ]);

    // AutoTable plugin
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133], textColor: 255 },
      theme: "grid"
    });

    doc.save("reports.pdf");
  };

  return (
    <div className="staff-card staff-card--full">

      {/* Header */}
      <div className="staff-card-header">
        <h2>Reports Management</h2>
        <p className="staff-card-subtitle">
          Review, approve, and manage staff reports efficiently.
        </p>
      </div>

      {/* Summary Cards Horizontal */}
      <div className="staff-summary-cards-container" style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div className="staff-summary-card" style={{ flex: 1, padding: "20px", borderRadius: "10px", background: "#f0f4f8", textAlign: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
          <h3 style={{ fontSize: "28px", marginBottom: "5px" }}>{stats.total}</h3>
          <p style={{ fontSize: "14px", color: "#555" }}>Total Reports</p>
        </div>
        <div className="staff-summary-card" style={{ flex: 1, padding: "20px", borderRadius: "10px", background: "#fffbe6", textAlign: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
          <h3 style={{ fontSize: "28px", marginBottom: "5px" }}>{stats.pending}</h3>
          <p style={{ fontSize: "14px", color: "#555" }}>Pending</p>
        </div>
        <div className="staff-summary-card" style={{ flex: 1, padding: "20px", borderRadius: "10px", background: "#e6ffed", textAlign: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
          <h3 style={{ fontSize: "28px", marginBottom: "5px" }}>{stats.approved}</h3>
          <p style={{ fontSize: "14px", color: "#555" }}>Approved</p>
        </div>
        <div className="staff-summary-card" style={{ flex: 1, padding: "20px", borderRadius: "10px", background: "#ffe6e6", textAlign: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
          <h3 style={{ fontSize: "28px", marginBottom: "5px" }}>{stats.rejected}</h3>
          <p style={{ fontSize: "14px", color: "#555" }}>Rejected</p>
        </div>
      </div>

      {/* Filters */}
      <div className="staff-toolbar">
        <input
          className="staff-input"
          placeholder="Search reports..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="staff-input"
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
        >
          <option>All</option>
          <option>Innovation</option>
          <option>Operations</option>
          <option>Finance</option>
          <option>HR</option>
        </select>
        <select
          className="staff-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
        <Button variant="ghost" onClick={() => setSortNewest(v => !v)}>
          Sort: {sortNewest ? "Newest" : "Oldest"}
        </Button>
        <Button variant="secondary" onClick={exportCSV}>Export CSV</Button>
        <Button variant="secondary" onClick={exportPDF}>Export PDF</Button>
      </div>

      {/* Reports Table */}
      <div className="staff-table-wrapper">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Report</th>
              <th>Staff</th>
              <th>Department</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReports.map(report => (
              <tr key={report.id}>
                <td>{report.title}</td>
                <td>{report.staff}</td>
                <td>{report.department}</td>
                <td>{report.date.toLocaleDateString()}</td>
                <td>
                  <span className={statusClass(report.status)}>
                    {report.status}
                  </span>
                </td>
                <td>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedReport(report)}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="staff-pagination">
        <Button size="sm" variant="ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>«</Button>
        <span>Page {page} of {totalPages}</span>
        <Button size="sm" variant="ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>»</Button>
      </div>

      {/* Report Modal */}
      {selectedReport && (
        <div className="staff-modal-overlay">
          <div className="staff-modal">
            <h3>{selectedReport.title}</h3>
            <p><strong>Staff:</strong> {selectedReport.staff}</p>
            <p><strong>Department:</strong> {selectedReport.department}</p>
            <p><strong>Date:</strong> {selectedReport.date.toLocaleDateString()}</p>
            <div className="staff-report-content">{selectedReport.content}</div>
            <div className="staff-modal-actions">
              <Button variant="success" onClick={() => updateStatus(selectedReport.id, "Approved")}>Approve</Button>
              <Button variant="danger" onClick={() => updateStatus(selectedReport.id, "Rejected")}>Reject</Button>
              <Button variant="ghost" onClick={() => setSelectedReport(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Reports;