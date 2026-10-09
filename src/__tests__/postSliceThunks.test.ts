import { configureStore } from "@reduxjs/toolkit";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/posts/api/postApi", () => ({
  postApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { postApi } from "@/features/posts/api/postApi";
import reducer, {
  clearSelectedPost,
  createPost,
  deletePost,
  fetchPostDetail,
  fetchPosts,
  updatePost,
} from "@/features/posts/states/postSlice";

const api = vi.mocked(postApi);
const post = { id: 1, title: "Post", content: "Body", user_id: 4, created_at: "now" };

function makeStore() {
  return configureStore({ reducer: { posts: reducer } });
}

describe("post slice thunks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads an array or posts collection and updates loading state", async () => {
    api.getAll.mockResolvedValueOnce({ data: [post] } as never);
    const store = makeStore();
    expect(store.getState().posts.isLoading).toBe(true);
    await store.dispatch(fetchPosts());
    expect(store.getState().posts.posts).toHaveLength(1);
    expect(store.getState().posts.isLoading).toBe(false);

    api.getAll.mockResolvedValueOnce({ data: { posts: [post, { ...post, id: 2 }] } } as never);
    await store.dispatch(fetchPosts());
    expect(store.getState().posts.posts).toHaveLength(2);

    api.getAll.mockResolvedValueOnce({ data: {} } as never);
    await store.dispatch(fetchPosts());
    expect(store.getState().posts.posts).toEqual([]);
  });

  it("handles failed post list requests and clears a previous error on retry", async () => {
    api.getAll.mockRejectedValueOnce(new Error("list unavailable"));
    const store = makeStore();
    await store.dispatch(fetchPosts());
    expect(store.getState().posts.error).toBe("list unavailable");
    expect(store.getState().posts.isLoading).toBe(false);

    api.getAll.mockResolvedValueOnce([] as never);
    await store.dispatch(fetchPosts());
    expect(store.getState().posts.error).toBeNull();
  });

  it("loads and clears the selected post, then handles detail errors", async () => {
    api.getById.mockResolvedValueOnce({ data: { post } } as never);
    const store = makeStore();
    await store.dispatch(fetchPostDetail(1));
    expect(store.getState().posts.selectedPost?.title).toBe("Post");
    store.dispatch(clearSelectedPost());
    expect(store.getState().posts.selectedPost).toBeNull();
    expect(store.getState().posts.error).toBeNull();

    api.getById.mockRejectedValueOnce(new Error("not found"));
    await store.dispatch(fetchPostDetail(2));
    expect(store.getState().posts.error).toBe("not found");

    api.getById.mockRejectedValueOnce({});
    await store.dispatch(fetchPostDetail(3));
    expect(store.getState().posts.error).toBe("Postingan tidak ditemukan");
  });

  it("creates posts and rejects failed create requests", async () => {
    api.create.mockResolvedValueOnce({ post } as never);
    const store = makeStore();
    await store.dispatch(createPost({ title: "Post", content: "Body" }));
    expect(store.getState().posts.posts).toEqual([expect.objectContaining({ id: 1 })]);

    api.create.mockRejectedValueOnce(new Error("create failed"));
    const result = await store.dispatch(createPost({ title: "x", content: "y" }));
    expect(createPost.rejected.match(result)).toBe(true);
  });

  it("updates an existing post and selected detail, and ignores posts not in the list", async () => {
    const store = makeStore();
    store.dispatch(fetchPosts.fulfilled([post], "request"));
    store.dispatch(fetchPostDetail.fulfilled(post, "request", 1));
    const updated = { ...post, title: "Updated" };
    api.update.mockResolvedValueOnce({ data: { post: updated } } as never);
    await store.dispatch(updatePost({ id: 1, title: "Updated", content: "Body" }));
    expect(store.getState().posts.posts[0].title).toBe("Updated");
    expect(store.getState().posts.selectedPost?.title).toBe("Updated");

    api.update.mockResolvedValueOnce({ post: { ...updated, id: 99 } } as never);
    await store.dispatch(updatePost({ id: 99, title: "New", content: "Body" }));
    expect(store.getState().posts.posts).toHaveLength(1);

    api.update.mockRejectedValueOnce(new Error("update failed"));
    const result = await store.dispatch(updatePost({ id: 1, title: "x", content: "y" }));
    expect(updatePost.rejected.match(result)).toBe(true);
  });

  it("deletes posts and reports failed deletes", async () => {
    const store = makeStore();
    store.dispatch(fetchPosts.fulfilled([post], "request"));
    api.delete.mockResolvedValueOnce(undefined as never);
    await store.dispatch(deletePost(1));
    expect(store.getState().posts.posts).toEqual([]);

    api.delete.mockRejectedValueOnce(new Error("delete failed"));
    const result = await store.dispatch(deletePost(1));
    expect(deletePost.rejected.match(result)).toBe(true);
  });
});
