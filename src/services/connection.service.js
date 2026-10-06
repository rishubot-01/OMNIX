import api from "./api";

/*
|--------------------------------------------------------------------------
| OMEE Connection Service
|--------------------------------------------------------------------------
|
| Backend base route:
| /api/connections
|
| Ye service Random Connect ke baad bani hui
| connection history ko handle karti hai.
|
*/

/*
|--------------------------------------------------------------------------
| Get My Connections
|--------------------------------------------------------------------------
|
| GET /api/connections?page=1&limit=20
|
| Returns:
| {
|   success: true,
|   data: {
|     connections: [...],
|     pagination: {...}
|   }
| }
|
*/

const getMyConnections = async (
  page = 1,
  limit = 20
) => {
  const safePage = Math.max(
    Number(page) || 1,
    1
  );

  const safeLimit = Math.min(
    Math.max(Number(limit) || 20, 1),
    100
  );

  const response = await api.get(
    `/connections?page=${safePage}&limit=${safeLimit}`
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Get Connection By ID
|--------------------------------------------------------------------------
|
| GET /api/connections/:connectionId
|
*/

const getConnection = async (
  connectionId
) => {
  if (!connectionId) {
    throw new Error(
      "Connection ID is required"
    );
  }

  const response = await api.get(
    `/connections/${encodeURIComponent(
      String(connectionId)
    )}`
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

const connectionService = {
  getMyConnections,
  getConnection,
};

export default connectionService;