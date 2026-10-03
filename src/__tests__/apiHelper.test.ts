import { describe, it, expect, beforeEach } from "vitest";
import { getToken, setToken, removeToken } from "@/helpers/apiHelper";

describe("apiHelper - Cookie & LocalStorage Token Management", () => {
  beforeEach(() => {
    removeToken();
  });

  it("dapat menyimpan dan mengambil token", () => {
    setToken("dummy-token-123");
    expect(getToken()).toBe("dummy-token-123");
  });

  it("dapat menghapus token", () => {
    setToken("dummy-token-123");
    removeToken();
    expect(getToken()).toBeNull();
  });
});