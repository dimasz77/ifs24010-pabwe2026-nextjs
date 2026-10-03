import { fetchApi } from "@/helpers/apiHelper";
import { User } from "@/types";

export const authApi = {
  login: (credentials: Record<string, string>) =>
    fetchApi<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (payload: Record<string, string>) =>
    fetchApi<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMe: () => fetchApi<{ user: User }>("/auth/me"),
};