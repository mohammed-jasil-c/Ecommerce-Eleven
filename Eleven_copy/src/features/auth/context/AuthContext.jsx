


import React, {
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";
import api from "../../../api/apiService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Load user on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const access = localStorage.getItem("access");
      const refresh = localStorage.getItem("refresh");

      if (!access) {
        setLoading(false);
        return;
      }

      try {
        // Try normal profile request
        const response = await api.get("/auth/profile/");
        setUser(response.data);
      } catch (error) {
        // If access expired → try refresh
        if (refresh) {
          try {
            const refreshResponse = await api.post("/auth/refresh/", {
              refresh: refresh,
            });

            const newAccess = refreshResponse.data.access;
            localStorage.setItem("access", newAccess);

            // Retry profile request
            const userResponse = await api.get("/auth/profile/");
            setUser(userResponse.data);
          } catch (refreshError) {
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            setUser(null);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // 🔹 Login (called after successful login page)
  const login = (userData) => {
    setUser(userData);
  };

  // 🔹 Logout
  const logout = async () => {
    try {
      await api.post("/auth/logout/");
    } catch (error) {
      console.error("Logout error:", error);
    }

    localStorage.removeItem("access");
    setUser(null);
    window.location.href = "/login";
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);