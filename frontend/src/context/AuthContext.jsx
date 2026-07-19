/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await api.get("/users/profile");
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      await Promise.resolve();
      await fetchProfile();
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/users/login", { email, password });
      const { token } = response.data;
      localStorage.setItem("token", token);
      
      // Load user profile
      const profileResponse = await api.get("/users/profile");
      setUser(profileResponse.data);
      return { success: true, user: profileResponse.data };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Invalid Email or Password",
      };
    }
  };

  const demoLogin = async () => {
    try {
      const response = await api.post("/users/demo-login");
      localStorage.setItem("token", response.data.token);

      const profileResponse = await api.get("/users/profile");
      setUser(profileResponse.data);
      return { success: true, user: profileResponse.data };
    } catch (error) {
      console.error("Demo login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Demo login failed. Please try again.",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post("/users/register", userData);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed. Please try again.",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, demoLogin, register, logout, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
