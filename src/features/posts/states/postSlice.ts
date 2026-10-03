import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { PostState, Post } from "@/types";
import { postApi } from "../api/postApi";

const initialState: PostState = {
  posts: [],
  selectedPost: null,
  isLoading: false,
  error: null,
};

export const fetchPosts = createAsyncThunk(
  "posts/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await postApi.getAll();
      return res.posts || [];
    } catch (err: unknown) {
      const error = err as Error;
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPostDetail = createAsyncThunk(
  "posts/fetchDetail",
  async (id: string | number, { rejectWithValue }) => {
    try {
      const res = await postApi.getById(id);
      return res.post;
    } catch (err: unknown) {
      const error = err as Error;
      return rejectWithValue(error.message);
    }
  }
);

export const createPost = createAsyncThunk(
  "posts/create",
  async (payload: { title: string; content: string }, { rejectWithValue }) => {
    try {
      const res = await postApi.create(payload);
      return res.post;
    } catch (err: unknown) {
      const error = err as Error;
      return rejectWithValue(error.message);
    }
  }
);

export const updatePost = createAsyncThunk(
  "posts/update",
  async (
    { id, title, content }: { id: string | number; title: string; content: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await postApi.update(id, { title, content });
      return res.post;
    } catch (err: unknown) {
      const error = err as Error;
      return rejectWithValue(error.message);
    }
  }
);

export const deletePost = createAsyncThunk(
  "posts/delete",
  async (id: string | number, { rejectWithValue }) => {
    try {
      await postApi.delete(id);
      return id;
    } catch (err: unknown) {
      const error = err as Error;
      return rejectWithValue(error.message);
    }
  }
);

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearSelectedPost: (state) => {
      state.selectedPost = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPostDetail.fulfilled, (state, action) => {
        state.selectedPost = action.payload;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        if (state.selectedPost?.id === action.payload.id) {
          state.selectedPost = action.payload;
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((p) => p.id !== action.payload);
      });
  },
});

export const { clearSelectedPost } = postSlice.actions;
export default postSlice.reducer;