import api from "../api/apiClient";

export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  },

  register: async (username: string, email: string, password: string) => {
    const res = await api.post("/auth/register", {
      userName: username,
      email,
      password,
    });

    return res.data;
  },

  me: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },
};