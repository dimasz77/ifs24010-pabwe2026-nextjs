import { fetchApi } from "@/helpers/apiHelper";
import { User } from "@/types";

export const userApi = {
  getAll: () => fetchApi<{ users: User[] }>("/users"),
  
  getById: (id: string | number) => fetchApi<{ user: User }>(`/users/${id}`),
  
  updateProfile: (data: Partial<User>) =>
    fetchApi<{ user: User }>("/users/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
    
  updatePassword: (passwordData: Record<string, string>) =>
    fetchApi<{ message: string }>("/users/password", {
      method: "PUT",
      body: JSON.stringify(passwordData),
    }),
};