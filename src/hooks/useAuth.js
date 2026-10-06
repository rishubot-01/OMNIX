import { useCallback } from "react";
import { useAuth as useAuthContext } from "../context/AuthContext";
import authService from "../services/auth.service";

function useAuth() {
  const {
    user,
    token,
    loading,
    isAuthenticated,
    login: saveAuth,
    logout: clearAuth,
    updateUser,
  } = useAuthContext();

  /*
   * Login
   */
  const login = useCallback(
    async ({ email, password }) => {
      const response =
        await authService.login({
          email,
          password,
        });

      const data =
        response?.data || response;

      const newToken =
        data?.token ||
        data?.accessToken;

      const newUser =
        data?.user ||
        data?.data?.user;

      if (!newToken) {
        throw new Error(
          "Login successful but authentication token was not received."
        );
      }

      saveAuth({
        token: newToken,
        user: newUser,
      });

      return response;
    },
    [saveAuth]
  );

  /*
   * Register
   */
  const register = useCallback(
    async (userData) => {
      const response =
        await authService.register(userData);

      return response;
    },
    []
  );

  /*
   * Logout
   */
  const logout = useCallback(async () => {
    try {
      if (authService.logout) {
        await authService.logout();
      }
    } catch (error) {
      console.error(
        "Logout API error:",
        error
      );
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  /*
   * Forgot password
   */
  const forgotPassword =
    useCallback(async (email) => {
      return authService.forgotPassword(
        email
      );
    }, []);

  /*
   * Reset password
   */
  const resetPassword =
    useCallback(
      async (tokenValue, password) => {
        return authService.resetPassword(
          tokenValue,
          password
        );
      },
      []
    );

  return {
    user,
    token,
    loading,
    isAuthenticated,

    login,
    register,
    logout,

    forgotPassword,
    resetPassword,

    updateUser,
  };
}

export default useAuth;
