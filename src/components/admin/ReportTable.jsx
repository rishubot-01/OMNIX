
import { useMemo, useState } from "react";

const initialReports = [
  {
    id: 1,
    reporter: "Aman Singh",
    reporterUsername: "@aman",
    target: "Rahul Kumar",
    targetUsername: "@rahul",
    type: "Post",
    reason: "Spam",
    description: "This post appears to contain repeated promotional content.",
    status: "Pending",
    createdAt: "24 Aug 2026",
  },
  {
    id: 2,
    reporter: "Neha Singh",
    reporterUsername: "@neha",
    target: "Amit Kumar",
    targetUsername: "@amit",
    type: "User",
    reason: "Harassment",
    description: "The reported user is sending abusive messages.",
    status: "Pending",
    createdAt: "23 Aug 2026",
  },
  {
    id: 3,
    reporter: "Rohit Sharma",
    reporterUsername: "@rohit",
    target: "Ravi Singh",
    targetUsername: "@ravi",
    type: "Post",
    reason: "Inappropriate Content",
    description: "The content may violate OMNIX community guidelines.",
    status: "Resolved",
    createdAt: "22 Aug 2026",
  },
  {
    id: 4,
    reporter: "Priya Kumar",
    reporterUsername: "@priya",
    target: "Ankit Singh",
    targetUsername: "@ankit",
    type: "User",
    reason: "Fake Account",
    description: "This account may be impersonating another person.",
    status: "Dismissed",
    createdAt: "21 Aug 2026",
  },
];

const statusStyles = {
  Pending: "bg-orange-50 text-orange-700",
  Resolved: "bg-green-50 text-green-700",
  Dismissed: "bg-gray-100 text-gray-600",
};

function ReportTable() {
  const [reports, setReports] = useState(initialReports);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedReport, setSelectedReport] = useState(null);

  const filteredReports = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return reports.filter((report) => {
      const matchesSearch =
        !searchValue ||
        report.reporter.toLowerCase().includes(searchValue) ||
        report.reporterUsername.toLowerCase().includes(searchValue) ||
        report.target.toLowerCase().includes(searchValue) ||
        report.targetUsername.toLowerCase().includes(searchValue) ||
        report.reason.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        report.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reports, search, statusFilter]);

  const updateReportStatus = (reportId, newStatus) => {
    setReports((currentReports) =>
      currentReports.map((report) =>
        report.id === reportId
          ? {
              ...report,
              status: newStatus,
            }
          : report
      )
    );

    setSelectedReport((currentReport) =>
      currentReport?.id === reportId
        ? {
            ...currentReport,
            status: newStatus,
          }
        : currentReport
    );
  };

  const resolveReport = (reportId) => {
    updateReportStatus(reportId, "Resolved");
  };

  const dismissReport = (reportId) => {
    updateReportStatus(reportId, "Dismissed");
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-gray-200 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-950">
              Reports
            </h2>

            {reports.filter(
              (report) => report.status === "Pending"
            ).length > 0 && (
              <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700">
                {
                  reports.filter(
                    (report) => report.status === "Pending"
                  ).length
                } pending
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Review reports submitted by the OMNIX community.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search */}
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search reports..."
              className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white sm:w-64"
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none focus:border-gray-400 focus:bg-white"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Resolved">Resolved</option>
            <option value="Dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[1050px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70 text-left">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Reporter
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Reported
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Type
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Reason
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Status
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredReports.map((report) => (
              <tr
                key={report.id}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60"
              >
                {/* Reporter */}
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-gray-900">
                    {report.reporter}
                  </p>

                  <p className="text-xs text-gray-500">
                    {report.reporterUsername}
                  </p>
                </td>

                {/* Target */}
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-gray-900">
                    {report.target}
                  </p>

                  <p className="text-xs text-gray-500">
                    {report.targetUsername}
                  </p>
                </td>

                {/* Type */}
                <td className="px-5 py-4">
                  <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                    {report.type}
                  </span>
                </td>

                {/* Reason */}
                <td className="max-w-[220px] px-5 py-4">
                  <p className="truncate text-sm font-medium text-gray-700">
                    {report.reason}
                  </p>
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                      statusStyles[report.status]
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        report.status === "Pending"
                          ? "bg-orange-500"
                          : report.status === "Resolved"
                            ? "bg-green-500"
                            : "bg-gray-400"
                      }`}
                    />

                    {report.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedReport(report)}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                    >
                      Review
                    </button>

                    {report.status === "Pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            resolveReport(report.id)
                          }
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-green-600 transition hover:bg-green-50"
                        >
                          Resolve
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            dismissReport(report.id)
                          }
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
                        >
                          Dismiss
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="divide-y divide-gray-100 md:hidden">
        {filteredReports.map((report) => (
          <div key={report.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {report.reason}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Reported by {report.reporterUsername}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-semibold ${
                  statusStyles[report.status]
                }`}
              >
                {report.status}
              </span>
            </div>

            <div className="mt-4 rounded-xl bg-gray-50 p-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] text-gray-400">
                    Reported User
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-700">
                    {report.targetUsername}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] text-gray-400">
                    Type
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-700">
                    {report.type}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedReport(report)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                Review
              </button>

              {report.status === "Pending" && (
                <>
                  <button
                    type="button"
                    onClick={() => resolveReport(report.id)}
                    className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-600"
                  >
                    Resolve
                  </button>

                  <button
                    type="button"
                    onClick={() => dismissReport(report.id)}
                    className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600"
                  >
                    Dismiss
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="px-5 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-6 w-6 text-gray-400"
            >
              <path d="M10.3 3.2 2.7 16.4A2 2 0 0 0 4.4 19h15.2a2 2 0 0 0 1.7-2.6L13.7 3.2a2 2 0 0 0-3.4 0Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>

          <p className="mt-3 text-sm font-semibold text-gray-700">
            No reports found
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Try changing your search or status filter.
          </p>
        </div>
      )}

      {/* Report Review Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h3 className="text-lg font-bold text-gray-950">
                  Review Report
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Report ID #{selectedReport.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-gray-500 hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            {/* Report Details */}
            <div className="space-y-5 p-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-400">
                    Reporter
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {selectedReport.reporter}
                  </p>

                  <p className="text-xs text-gray-500">
                    {selectedReport.reporterUsername}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400">
                    Reported Account
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {selectedReport.target}
                  </p>

                  <p className="text-xs text-gray-500">
                    {selectedReport.targetUsername}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-[11px] text-gray-400">
                    Type
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-700">
                    {selectedReport.type}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-[11px] text-gray-400">
                    Reason
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-700">
                    {selectedReport.reason}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-[11px] text-gray-400">
                    Status
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-700">
                    {selectedReport.status}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400">
                  Description
                </p>

                <div className="mt-2 rounded-xl bg-gray-50 p-4">
                  <p className="text-sm leading-6 text-gray-700">
                    {selectedReport.description}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400">
                  Submitted
                </p>

                <p className="mt-1 text-sm text-gray-700">
                  {selectedReport.createdAt}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col gap-2 border-t border-gray-100 p-5 sm:flex-row">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Close
              </button>

              {selectedReport.status === "Pending" && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      resolveReport(selectedReport.id);
                      setSelectedReport(null);
                    }}
                    className="flex-1 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                  >
                    Resolve Report
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      dismissReport(selectedReport.id);
                      setSelectedReport(null);
                    }}
                    className="flex-1 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                  >
                    Dismiss
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ReportTable;
