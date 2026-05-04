import {
  createContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
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
  password?: string; // Store password for session key decryption

  login: (email: string, password: string) => Promise<any>;
  setSession: (
    access: string,
    refresh: string,
    user?: User | null,
    password?: string
  ) => void;
  logoutUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState<string | undefined>(undefined);

  // 🔥 LOAD SESSION ON APP START
  useEffect(() => {
    const init = async () => {
      try {
        let token, refresh;
        if (Platform.OS === "web") {
          token = localStorage.getItem("accessToken");
          refresh = localStorage.getItem("refreshToken");
        } else {
          token = await SecureStore.getItemAsync("accessToken");
          refresh = await SecureStore.getItemAsync("refreshToken");
        }

        if (token) setAccessToken(token);
        if (refresh) setRefreshToken(refresh);
      } catch (e) {
        console.error("Auth init error:", e);
      } finally {
        setLoading(false);
      }
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
    userData: User | null = null,
    userPassword?: string
  ) => {
    setAccessToken(access);
    setRefreshToken(refresh);
    if (userPassword) setPassword(userPassword);

    if (Platform.OS === "web") {
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
    } else {
      SecureStore.setItemAsync("accessToken", access);
      SecureStore.setItemAsync("refreshToken", refresh);
    }

    if (userData) setUser(userData);
  };

  const logoutUser = async () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setPassword(undefined);

    if (Platform.OS === "web") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    } else {
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        loading,
        password,
        login,
        setSession,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}