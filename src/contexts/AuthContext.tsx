import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiService from "@/lib/api";
import { setAuthData, logout as clearAuth } from "@/lib/auth";

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  lastLogin?: string;
  preferences?: any;
  profile?: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

// Reducer actions
type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: { user: User; token: string } }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USER"; payload: Partial<User> }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_LOADING"; payload: boolean };

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: false,
  error: null,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, isLoading: true, error: null };
    case "AUTH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case "AUTH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Attach token to apiService on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) apiService.setToken(token);
  }, []);

  // ✅ Initialize auth on load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        dispatch({ type: "LOGOUT" });
        if (location.pathname !== "/auth") navigate("/auth", { replace: true });
        return;
      }

      try {
        dispatch({ type: "SET_LOADING", payload: true });
        const response = await apiService.getCurrentUser();

        if (response.success) {
          dispatch({
            type: "AUTH_SUCCESS",
            payload: { user: response.data.user, token },
          });
        } else {
          dispatch({ type: "LOGOUT" });
          navigate("/auth", { replace: true });
        }
      } catch (error) {
        console.error("Auth init error:", error);
        dispatch({ type: "LOGOUT" });
        navigate("/auth", { replace: true });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    initializeAuth();
  }, [navigate, location.pathname]);

  // 🔹 Login
  const login = async (email: string, password: string): Promise<void> => {
    try {
      dispatch({ type: "AUTH_START" });
      const response = await apiService.login({ email, password });
      if (response.success) {
        const { token, user } = response.data;
        apiService.setToken(token);
        setAuthData(token, user);
        dispatch({ type: "AUTH_SUCCESS", payload: { user, token } });
        navigate("/", { replace: true });
      } else throw new Error(response.message || "Login failed");
    } catch (error: any) {
      dispatch({
        type: "AUTH_FAILURE",
        payload: error.message || "Login failed",
      });
      throw error;
    }
  };

  // 🔹 Register
  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<void> => {
    try {
      dispatch({ type: "AUTH_START" });
      const response = await apiService.register({ name, email, password });
      if (response.success) {
        const { token, user } = response.data;
        apiService.setToken(token);
        setAuthData(token, user);
        dispatch({ type: "AUTH_SUCCESS", payload: { user, token } });
        navigate("/", { replace: true });
      } else throw new Error(response.message || "Registration failed");
    } catch (error: any) {
      dispatch({
        type: "AUTH_FAILURE",
        payload: error.message || "Registration failed",
      });
      throw error;
    }
  };

  // 🔹 Logout (fully robust)
  const logout = (): void => {
    try {
      clearAuth();
      apiService.removeToken();
      dispatch({ type: "LOGOUT" });

      // Ensure we actually navigate to /auth
      navigate("/auth", { replace: true });
      setTimeout(() => {
        if (!window.location.pathname.includes("/auth")) {
          window.location.href = "/auth";
        }
      }, 200);
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/auth";
    }
  };

  const updateUser = (userData: Partial<User>): void => {
    dispatch({ type: "UPDATE_USER", payload: userData });
  };

  const clearError = (): void => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await apiService.getCurrentUser();
      if (response.success) {
        dispatch({ type: "UPDATE_USER", payload: response.data.user });
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      dispatch({ type: "LOGOUT" });
      navigate("/auth", { replace: true });
    }
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export default AuthContext;
