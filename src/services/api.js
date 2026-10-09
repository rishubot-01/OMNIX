import { STORAGE_KEYS } from "../utils/constants";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://omnix-bd.onrender.com/api";

// --------------------------------------------------
// Get authentication token
// --------------------------------------------------

const getToken = () => {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
};

// --------------------------------------------------
// API Request
// --------------------------------------------------

const request = async (endpoint, options = {}) => {
  const token = getToken();

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData
      ? {}
      : {
          "Content-Type": "application/json",
        }),
    ...(options.headers || {}),
  };

  // FormData ke saath browser ko Content-Type khud set karne do
  if (isFormData) {
    delete headers["Content-Type"];
    delete headers["content-type"];
  }

  // Authentication
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  // --------------------------------------------------
  // Parse response
  // --------------------------------------------------

  let data = null;

  try {
    const contentType =
      response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }
  } catch {
    data = null;
  }

  // --------------------------------------------------
  // Error handling
  // --------------------------------------------------

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null
        ? data?.message ||
          data?.error ||
          `Request failed with status ${response.status}`
        : data ||
          `Request failed with status ${response.status}`;

    const error = new Error(message);

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
};

// --------------------------------------------------
// API Methods
// --------------------------------------------------

const api = {
  // GET
  get: (endpoint, options = {}) =>
    request(endpoint, {
      ...options,
      method: "GET",
    }),

  // POST
  post: (endpoint, body, options = {}) =>
    request(endpoint, {
      ...options,
      method: "POST",
      body:
        body instanceof FormData
          ? body
          : JSON.stringify(body),
    }),

  // PUT
  put: (endpoint, body, options = {}) =>
    request(endpoint, {
      ...options,
      method: "PUT",
      body:
        body instanceof FormData
          ? body
          : JSON.stringify(body),
    }),

  // PATCH
  patch: (endpoint, body, options = {}) =>
    request(endpoint, {
      ...options,
      method: "PATCH",
      body:
        body instanceof FormData
          ? body
          : JSON.stringify(body),
    }),

  // DELETE
  delete: (endpoint, options = {}) =>
    request(endpoint, {
      ...options,
      method: "DELETE",
    }),
};

export default api;