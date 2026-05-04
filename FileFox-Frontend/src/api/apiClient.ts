import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const api = axios.create({
  baseURL: "https://localhost:7227",
});

api.interceptors.request.use(async (config) => {
  let token;
  if (Platform.OS === "web") {
    token = localStorage.getItem("accessToken");
  } else {
    token = await SecureStore.getItemAsync("accessToken");
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;