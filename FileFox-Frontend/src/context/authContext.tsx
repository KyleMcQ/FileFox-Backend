import {
  createContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import api from "../api/apiClient";

export interface User {
  id?: string;
  userName?: string;
  email?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;

  login: (email: string, password: string) => Promise<any>;
  setSession: (
    access: string,
    refresh: string,
    user?: User | null
  ) => void;
  logoutUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔥 LOAD SESSION ON APP START
  useEffect(() => {
    const init = async () => {
      const token = await SecureStore.getItemAsync("accessToken");
      const refresh = await SecureStore.getItemAsync("refreshToken");

      if (token) setAccessToken(token);
      if (refresh) setRefreshToken(refresh);

      setLoading(false);
    };

    init();
  }, []);

  // 🔥 LOGIN (REAL IMPLEMENTATION)
  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", {
      email,
      password,
    });

    return data;
  };

  // 🔥 SET SESSION (CRITICAL FIX FOR DRAWER BUG)
  const setSession = (
    access: string,
    refresh: string,
    userData: User | null = null
  ) => {
    setAccessToken(access);
    setRefreshToken(refresh);

    SecureStore.setItemAsync("accessToken", access);
    SecureStore.setItemAsync("refreshToken", refresh);

    if (userData) setUser(userData);
  };

  const logoutUser = async () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);

    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        loading,
        login,
        setSession,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}