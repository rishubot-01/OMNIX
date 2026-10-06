import { useCallback, useEffect, useState } from "react";
import connectionService from "../services/connection.service";

const useConnections = (initialPage = 1, initialLimit = 20) => {
  const [connections, setConnections] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchConnections = useCallback(
    async (page = initialPage, limit = initialLimit) => {
      try {
        setLoading(true);
        setError("");

        const data = await connectionService.getMyConnections(page, limit);

        setConnections(data?.connections || []);
        setPagination(data?.pagination || null);

        return data;
      } catch (err) {
        const message =
          err?.message || "Failed to load connections";

        setError(message);
        setConnections([]);
        setPagination(null);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [initialPage, initialLimit]
  );

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const refreshConnections = useCallback(() => {
    return fetchConnections(initialPage, initialLimit);
  }, [fetchConnections, initialPage, initialLimit]);

  return {
    connections,
    pagination,
    loading,
    error,
    fetchConnections,
    refreshConnections,
  };
};

export default useConnections;