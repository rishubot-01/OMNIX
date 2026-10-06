import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";

import useAuth from "../../hooks/useAuth";
import useConnections from "../../hooks/useConnections";
import ConnectionList from "../../components/omee/connections/ConnectionList";

const MyConnections = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const currentUserId = user?._id || user?.id;

  const {
    connections,
    pagination,
    loading,
    error,
    refreshConnections,
  } = useConnections();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl bg-white dark:bg-black">
      {/* Header */}
      <div className="sticky top-0 z-20 flex h-14 items-center border-b border-gray-200 bg-white/95 px-4 backdrop-blur dark:border-gray-800 dark:bg-black/95">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          className="mr-3 flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft
            size={21}
            className="text-gray-900 dark:text-white"
          />
        </button>

        <h1 className="flex-1 text-lg font-semibold text-gray-900 dark:text-white">
          My Connections
        </h1>

        <button
          type="button"
          onClick={refreshConnections}
          disabled={loading}
          aria-label="Refresh connections"
          className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800"
        >
          <RefreshCw
            size={19}
            className={`text-gray-900 dark:text-white ${
              loading ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>

      {/* Connection count */}
      {!loading && !error && connections.length > 0 && (
        <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {pagination?.total !== undefined
              ? `${pagination.total} connection${
                  pagination.total === 1 ? "" : "s"
                }`
              : `${connections.length} connection${
                  connections.length === 1 ? "" : "s"
                }`}
          </p>
        </div>
      )}

      {/* Connection list */}
      <ConnectionList
        connections={connections}
        currentUserId={currentUserId}
        loading={loading}
        error={error}
        onRetry={refreshConnections}
      />
    </div>
  );
};

export default MyConnections;