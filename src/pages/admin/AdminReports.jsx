import ReportTable from "../../components/admin/ReportTable";

function AdminReports() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Reports
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Review reports submitted by OMNIX users.
        </p>
      </div>

      <ReportTable />
    </div>
  );
}

export default AdminReports;