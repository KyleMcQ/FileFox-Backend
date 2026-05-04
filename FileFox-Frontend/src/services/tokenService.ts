import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS = "accessToken";
const REFRESH = "refreshToken";

export const tokenService = {
  getAccess: () => {
    if (Platform.OS === "web") return localStorage.getItem(ACCESS);
    return SecureStore.getItemAsync(ACCESS);
  },
  getRefresh: () => {
    if (Platform.OS === "web") return localStorage.getItem(REFRESH);
    return SecureStore.getItemAsync(REFRESH);
  },

  setTokens: async (access: string, refresh: string) => {
    if (Platform.OS === "web") {
      localStorage.setItem(ACCESS, access);
      localStorage.setItem(REFRESH, refresh);
    } else {
      await SecureStore.setItemAsync(ACCESS, access);
      await SecureStore.setItemAsync(REFRESH, refresh);
    }
  },

  clear: async () => {
    if (Platform.OS === "web") {
      localStorage.removeItem(ACCESS);
      localStorage.removeItem(REFRESH);
    } else {
      await SecureStore.deleteItemAsync(ACCESS);
      await SecureStore.deleteItemAsync(REFRESH);
    }
  },
};