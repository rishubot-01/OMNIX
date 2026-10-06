import api from "./api";

const authService = {
  register: async (userData) => {
    return api.post("/auth/register", userData);
  },

  login: async ({ email, password }) => {
    const payload = {
      email,
      password,
    };

    console.log("Login request payload:", payload);

    const response = await api.post("/auth/login", payload);

    if (response?.token) {
      localStorage.setItem("token", response.token);
    }

    if (response?.user) {
      localStorage.setItem("user", JSON.stringify(response.user));
    }

    return response;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: async () => {
    return api.get("/auth/me");
  },

  getStoredUser: () => {
    const user = localStorage.getItem("user");

    try {
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    return Boolean(localStorage.getItem("token"));
  },
};

export default authService;
