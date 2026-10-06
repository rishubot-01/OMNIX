import PostTable from "../../components/admin/PostTable";

function AdminPosts() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Posts
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage posts published on OMNIX.
        </p>
      </div>

      <PostTable />
    </div>
  );
}

export default AdminPosts;