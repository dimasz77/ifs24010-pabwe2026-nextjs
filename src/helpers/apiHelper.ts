import { API_BASE_URL } from "@/lib/config";
import Cookies from "js-cookie";

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return Cookies.get("token") || localStorage.getItem("token");
};

export const setToken = (token: string) => {
  Cookies.set("token", token, { expires: 7 });
  localStorage.setItem("token", token);
};

export const removeToken = () => {
  Cookies.remove("token");
  localStorage.removeItem("token");
};

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Terjadi kesalahan pada request API");
  }

  return data;
}