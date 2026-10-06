import api from "./api";

/*
|--------------------------------------------------------------------------
| OMEE Live Service
|--------------------------------------------------------------------------
|
| Backend base route:
| /api/lives
|
| REST API yahan live session ki information aur
| lifecycle handle karegi.
|
| Real-time signaling, comments, reactions aur
| viewer updates Socket.IO se handle honge.
|
*/

/*
|--------------------------------------------------------------------------
| Get Active Lives
|--------------------------------------------------------------------------
|
| GET /api/lives?page=1&limit=20
|
| Currently running public/live sessions.
|
*/

const getActiveLives = async (
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
    `/lives?page=${safePage}&limit=${safeLimit}`
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Get My Live History
|--------------------------------------------------------------------------
|
| GET /api/lives/my?page=1&limit=20
|
| Logged-in host ki previous live sessions.
|
*/

const getMyLives = async (
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
    `/lives/my?page=${safePage}&limit=${safeLimit}`
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Get My Active Live
|--------------------------------------------------------------------------
|
| GET /api/lives/my/active
|
| Check karta hai ki current user already
| live hai ya nahi.
|
*/

const getMyActiveLive = async () => {
  const response = await api.get(
    "/lives/my/active"
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Create / Start Live
|--------------------------------------------------------------------------
|
| POST /api/lives
|
| Body:
| {
|   title,
|   visibility
| }
|
| visibility:
| PUBLIC
| FOLLOWERS
|
*/

const createLive = async (
  title,
  visibility = "PUBLIC"
) => {
  const cleanTitle =
    typeof title === "string"
      ? title.trim()
      : "";

  if (!cleanTitle) {
    throw new Error(
      "Live title is required"
    );
  }

  if (
    visibility !== "PUBLIC" &&
    visibility !== "FOLLOWERS"
  ) {
    throw new Error(
      "Invalid live visibility"
    );
  }

  const response = await api.post(
    "/lives",
    {
      title: cleanTitle,
      visibility,
    }
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Get Live By ID
|--------------------------------------------------------------------------
|
| GET /api/lives/:liveId
|
*/

const getLive = async (
  liveId
) => {
  if (!liveId) {
    throw new Error(
      "Live ID is required"
    );
  }

  const response = await api.get(
    `/lives/${encodeURIComponent(
      String(liveId)
    )}`
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Get Active Live By ID
|--------------------------------------------------------------------------
|
| GET /api/lives/:liveId/active
|
*/

const getActiveLive = async (
  liveId
) => {
  if (!liveId) {
    throw new Error(
      "Live ID is required"
    );
  }

  const response = await api.get(
    `/lives/${encodeURIComponent(
      String(liveId)
    )}/active`
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| End Live
|--------------------------------------------------------------------------
|
| POST /api/lives/:liveId/end
|
| Backend host verify karega.
| Sirf live ka host session end kar sakta hai.
|
*/

const endLive = async (
  liveId
) => {
  if (!liveId) {
    throw new Error(
      "Live ID is required"
    );
  }

  const response = await api.post(
    `/lives/${encodeURIComponent(
      String(liveId)
    )}/end`
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

const liveService = {
  getActiveLives,
  getMyLives,
  getMyActiveLive,
  createLive,
  getLive,
  getActiveLive,
  endLive,
};

export default liveService;