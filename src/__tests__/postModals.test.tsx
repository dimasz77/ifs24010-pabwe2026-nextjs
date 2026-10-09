import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { dispatch, updateCover } = vi.hoisted(() => ({
  dispatch: vi.fn(),
  updateCover: vi.fn(),
}));

vi.mock("@/hooks/redux", () => ({ useAppDispatch: () => dispatch }));
vi.mock("@/features/posts/api/postApi", () => ({
  postApi: { updateCover },
}));
vi.mock("@/features/posts/states/postSlice", () => ({
  createPost: vi.fn((payload) => ({ type: "posts/create", payload })),
  updatePost: vi.fn((payload) => ({ type: "posts/update", payload })),
}));

import CreatePostModal from "@/features/posts/components/CreatePostModal";
import EditPostModal from "@/features/posts/components/EditPostModal";
import ChangeCoverModal from "@/features/posts/components/ChangeCoverModal";
import { createPost, updatePost } from "@/features/posts/states/postSlice";

const post = { id: 12, title: "Judul lama", content: "Isi lama", user_id: 1, created_at: "" };

describe("post modals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dispatch.mockResolvedValue({ type: "fulfilled" });
    updateCover.mockResolvedValue({});
  });

  it("does not create a post when required values are empty", () => {
    render(<CreatePostModal isOpen onClose={vi.fn()} />);
    fireEvent.submit(screen.getByRole("button", { name: "Publikasikan" }).closest("form")!);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("creates a post and clears the form after success", async () => {
    const onClose = vi.fn();
    render(<CreatePostModal isOpen onClose={onClose} />);
    fireEvent.change(screen.getByLabelText("Judul"), { target: { value: "Baru" } });
    fireEvent.change(screen.getByLabelText("Konten"), { target: { value: "Isi baru" } });
    fireEvent.click(screen.getByRole("button", { name: "Publikasikan" }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(createPost).toHaveBeenCalledWith({ title: "Baru", content: "Isi baru" });
    expect(dispatch).toHaveBeenCalled();
  });

  it("does not update when there is no selected post", () => {
    render(<EditPostModal isOpen onClose={vi.fn()} post={null} />);
    fireEvent.submit(screen.getByRole("button", { name: "Simpan Perubahan" }).closest("form")!);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("initializes edit fields and saves changes", async () => {
    const onClose = vi.fn();
    const { rerender } = render(<EditPostModal isOpen onClose={onClose} post={post} />);
    expect(screen.getByLabelText("Judul")).toHaveValue("Judul lama");
    expect(screen.getByLabelText("Konten")).toHaveValue("Isi lama");
    rerender(
      <EditPostModal
        isOpen
        onClose={onClose}
        post={{ ...post, title: "", content: "" }}
      />
    );
    expect(screen.getByLabelText("Judul")).toHaveValue("");
    expect(screen.getByLabelText("Konten")).toHaveValue("");
    rerender(<EditPostModal isOpen onClose={onClose} post={post} />);
    fireEvent.change(screen.getByLabelText("Judul"), { target: { value: "Judul baru" } });
    fireEvent.change(screen.getByLabelText("Konten"), { target: { value: "Konten baru" } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan Perubahan" }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(updatePost).toHaveBeenCalledWith({
      id: post.id,
      title: "Judul baru",
      content: "Konten baru",
    });
  });

  it("does not update when either edit field is empty", () => {
    render(<EditPostModal isOpen onClose={vi.fn()} post={post} />);
    fireEvent.change(screen.getByLabelText("Judul"), { target: { value: "" } });
    fireEvent.submit(screen.getByRole("button", { name: "Simpan Perubahan" }).closest("form")!);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("does not update a cover when the URL is empty", () => {
    render(<ChangeCoverModal isOpen onClose={vi.fn()} onSuccess={vi.fn()} postId={12} />);
    fireEvent.submit(screen.getByRole("button", { name: "Perbarui Cover" }).closest("form")!);
    expect(updateCover).not.toHaveBeenCalled();
  });

  it("updates a cover and calls success and close callbacks", async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    render(<ChangeCoverModal isOpen onClose={onClose} onSuccess={onSuccess} postId={12} />);
    fireEvent.change(screen.getByLabelText("URL Gambar"), {
      target: { value: "https://example.test/cover.png" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Perbarui Cover" }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(updateCover).toHaveBeenCalledWith(12, "https://example.test/cover.png");
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it("shows API errors and falls back when the error has no message", async () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <ChangeCoverModal isOpen onClose={onClose} onSuccess={vi.fn()} postId="12" />
    );
    fireEvent.change(screen.getByLabelText("URL Gambar"), {
      target: { value: "https://example.test/cover.png" },
    });
    updateCover.mockRejectedValueOnce(new Error("Gagal dari API"));
    fireEvent.click(screen.getByRole("button", { name: "Perbarui Cover" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Gagal dari API");
    expect(onClose).not.toHaveBeenCalled();

    rerender(<ChangeCoverModal isOpen onClose={onClose} onSuccess={vi.fn()} postId="12" />);
    fireEvent.change(screen.getByLabelText("URL Gambar"), {
      target: { value: "https://example.test/cover.png" },
    });
    updateCover.mockRejectedValueOnce({});
    fireEvent.click(screen.getByRole("button", { name: "Perbarui Cover" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Gagal memperbarui gambar sampul"
    );
  });
});
