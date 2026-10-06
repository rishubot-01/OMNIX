import ConnectionCard from "./ConnectionCard";

const ConnectionList = ({
  connections = [],
  currentUserId,
  loading = false,
  error = "",
  onRetry,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-800">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="flex items-center gap-4 px-4 py-4"
          >
            <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />

            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-3 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            </div>

            <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
            <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
        <p className="text-sm text-red-500">
          {error}
        </p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (!connections.length) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <span className="text-2xl">👥</span>
        </div>

        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          No connections yet
        </h3>

        <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
          Your random connections will appear here after you connect with someone.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {connections.map((connection) => {
        const connectionId =
          connection?._id ||
          connection?.id ||
          `${connection?.connectedAt}-${connection?.users?.join?.("-")}`;

        return (
          <ConnectionCard
            key={connectionId}
            connection={connection}
            currentUserId={currentUserId}
          />
        );
      })}
    </div>
  );
};

export default ConnectionList;