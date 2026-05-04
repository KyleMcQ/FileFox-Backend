import axios from "axios";
import * as SecureStore from "expo-secure-store";

const api = axios.create({
  baseURL:
    "https://filefox-api-prod-hcc3e9cmcpfyefax.ukwest-01.azurewebsites.net",
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;