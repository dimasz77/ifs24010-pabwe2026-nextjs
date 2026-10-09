import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiError, fetchApi, getToken, setToken, removeToken } from "@/helpers/apiHelper";

describe("apiHelper - Cookie & LocalStorage Token Management", () => {
  beforeEach(() => {
    removeToken();
  });

  describe("apiHelper - fetchApi", () => {
    const fetchMock = vi.fn();
    const browserWindow = globalThis.window;

    beforeEach(() => {
      fetchMock.mockReset();
      vi.stubGlobal("fetch", fetchMock);
      localStorage.clear();
    });

    it("sets JSON and bearer headers and returns the response body", async () => {
      setToken("session-token");
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ data: "ok" }),
      });

      await expect(fetchApi("/posts")).resolves.toEqual({ data: "ok" });
      const [, request] = fetchMock.mock.calls[0];
      expect(request.headers.get("Content-Type")).toBe("application/json");
      expect(request.headers.get("Authorization")).toBe("Bearer session-token");
    });

    it("preserves explicit authorization headers and avoids JSON headers for FormData", async () => {
      setToken("session-token");
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ uploaded: true }),
      });
      const body = new FormData();
      body.append("file", new Blob(["image"]));

      await fetchApi("/upload", {
        method: "POST",
        body,
        headers: { Authorization: "Custom token" },
      });

      const [, request] = fetchMock.mock.calls[0];
      expect(request.headers.get("Content-Type")).toBeNull();
      expect(request.headers.get("Authorization")).toBe("Custom token");
    });

    it("preserves an explicit content type and safely handles server-side token access", async () => {
      vi.stubGlobal("window", undefined);
      expect(getToken()).toBeNull();
      setToken("ignored-token");
      removeToken();
      vi.stubGlobal("window", browserWindow);

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ ok: true }),
      });
      await fetchApi("/plain", { headers: { "Content-Type": "text/plain" } });
      const [, request] = fetchMock.mock.calls[0];
      expect(request.headers.get("Content-Type")).toBe("text/plain");
      expect(request.headers.get("Authorization")).toBeNull();
    });

    it("uses the server error message and falls back when the response is not JSON", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({ message: "Bad request" }),
      });
      await expect(fetchApi("/fail")).rejects.toMatchObject({
        name: "ApiError",
        message: "Bad request",
        status: 400,
      });

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 502,
        json: vi.fn().mockRejectedValue(new Error("invalid json")),
      });
      await expect(fetchApi("/gateway")).rejects.toMatchObject({
        message: "Terjadi kesalahan pada server",
        status: 502,
      });
      expect(new ApiError("example", 418)).toMatchObject({
        name: "ApiError",
        status: 418,
      });
    });
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
import { unwrapData, pickEntity } from "@/helpers/apiHelper";

describe("apiHelper - unwrap respons API", () => {
  it("mengambil isi data dari respons terbungkus", () => {
    expect(unwrapData({ success: true, data: { token: "t" } })).toEqual({ token: "t" });
  });

  it("mengembalikan respons apa adanya bila tidak ada data", () => {
    expect(unwrapData({ token: "t" })).toEqual({ token: "t" });
  });

  it("pickEntity mendukung { data: { post } } maupun { post }", () => {
    expect(pickEntity({ data: { post: { id: 1 } } }, "post")).toEqual({ id: 1 });
    expect(pickEntity({ post: { id: 2 } }, "post")).toEqual({ id: 2 });
    expect(pickEntity({ other: true }, "post")).toEqual({ other: true });
    expect(pickEntity(null, "post")).toBeNull();
  });
});
