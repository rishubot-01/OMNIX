import UserTable from "../../components/admin/UserTable";

function AdminUsers() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Users
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage OMNIX users.
        </p>
      </div>

      <UserTable />
    </div>
  );
}

export default AdminUsers;