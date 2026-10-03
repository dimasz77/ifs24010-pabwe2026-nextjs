import { fetchApi } from "@/helpers/apiHelper";
import { Post } from "@/types";

export const postApi = {
  getAll: () => fetchApi<{ posts: Post[] }>("/posts"),
  getById: (id: string | number) => fetchApi<{ post: Post }>(`/posts/${id}`),
  create: (data: { title: string; content: string }) =>
    fetchApi<{ post: Post }>("/posts", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string | number, data: { title: string; content: string }) =>
    fetchApi<{ post: Post }>(`/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string | number) =>
    fetchApi<{ message: string }>(`/posts/${id}`, {
      method: "DELETE",
    }),
  updateCover: (id: string | number, coverUrl: string) =>
    fetchApi<{ post: Post }>(`/posts/${id}/cover`, {
      method: "PATCH",
      body: JSON.stringify({ cover: coverUrl }),
    }),
};