import { describe, it, expect } from "vitest";
import authReducer, { logout, clearError } from "@/features/auth/states/authSlice";

describe("authSlice Reducer Unit Tests", () => {
  const initialState = {
    user: { id: "1", name: "User Test", email: "test@delcom.org" },
    token: "valid-token",
    isLoading: false,
    error: "Terjadi kesalahan",
  };

  it("harus menangani aksi logout secara mereset state", () => {
    const state = authReducer(initialState, logout());
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it("harus membersihkan pesan error dengan clearError", () => {
    const state = authReducer(initialState, clearError());
    expect(state.error).toBeNull();
  });
});