import { fetchApi } from "@/helpers/apiHelper";
import { User } from "../states/userSlice";

export const getUserProfile = async (): Promise<{ status: string; data: User }> => {
  return await fetchApi("/users/me");
};

export const getUsers = async (): Promise<{ status: string; data: User[] }> => {
  return await fetchApi("/users");
};

export const updateProfile = async (payload: { name: string; bio: string }): Promise<{ status: string; data: User }> => {
  return await fetchApi("/users/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const updatePassword = async (payload: { old_password: string; new_password: string }): Promise<{ status: string }> => {
  return await fetchApi("/users/password", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};