import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DetailPage from "@/features/posts/pages/DetailPage";
import { fetchPostDetail, clearSelectedPost } from "@/features/posts/states/postSlice";

const { dispatch, mockState } = vi.hoisted(() => ({
  dispatch: vi.fn(),
  mockState: { current: {} as any },
}));

vi.mock("@/hooks/redux", () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (selector: any) => selector(mockState.current),
}));

vi.mock("@/features/posts/states/postSlice", () => ({
  fetchPostDetail: vi.fn((id: string) => ({ type: "posts/fetchPostDetail", payload: id })),
  clearSelectedPost: vi.fn(() => ({ type: "posts/clearSelectedPost" })),
}));

vi.mock("@/helpers/imageUrl", () => ({
  getImageUrl: (cover?: string) => (cover ? `http://img.test/${cover}` : ""),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

vi.mock("@/components/ui/LoadingSkeleton", () => ({
  default: ({ count }: { count: number }) => <div data-testid="skeleton">{count}</div>,
}));

vi.mock("@/features/posts/components/ChangeCoverModal", () => ({
  default: ({ isOpen, onClose, postId, onSuccess }: any) =>
    isOpen ? (
      <div data-testid="cover-modal" data-post={postId}>
        <button onClick={onClose}>close-cover</button>
        <button onClick={onSuccess}>success-cover</button>
      </div>
    ) : null,
}));

const makeParams = (postId = "10") =>
  Object.assign(Promise.resolve({ postId }), {
    status: "fulfilled",
    value: { postId },
  }) as unknown as Promise<{ postId: string }>;

const basePost = {
  id: 10,
  user_id: 7,
  title: "Judul Post",
  content: "Isi konten post",
  cover: "cover.png",
  created_at: "2026-01-01T00:00:00Z",
  user: { name: "Dimas" },
};

const setState = (overrides: any = {}) => {
  mockState.current = {
    posts: { selectedPost: basePost, isLoading: false, error: null, ...overrides.posts },
    auth: { user: { id: 7 }, token: "abc", ...overrides.auth },
  };
};

describe("DetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setState();
  });

  it("fetch detail saat token ada dan clear saat unmount", () => {
    const { unmount } = render(<DetailPage params={makeParams("10")} />);
    expect(fetchPostDetail).toHaveBeenCalledWith("10");
    unmount();
    expect(clearSelectedPost).toHaveBeenCalled();
  });

  it("tidak fetch saat token kosong", () => {
    setState({ auth: { token: null } });
    render(<DetailPage params={makeParams()} />);
    expect(fetchPostDetail).not.toHaveBeenCalled();
  });

  it("menampilkan skeleton saat loading", () => {
    setState({ posts: { isLoading: true } });
    render(<DetailPage params={makeParams()} />);
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
  });

  it("menampilkan skeleton saat post belum ada dan tanpa error", () => {
    setState({ posts: { selectedPost: null } });
    render(<DetailPage params={makeParams()} />);
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
  });

  it("menampilkan pesan error saat post gagal dimuat", () => {
    setState({ posts: { selectedPost: null, error: "Tidak ditemukan" } });
    render(<DetailPage params={makeParams()} />);
    expect(screen.getByText("Postingan tidak dapat dimuat")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Tidak ditemukan");
    expect(screen.getByRole("link", { name: "Kembali ke Feed" })).toHaveAttribute("href", "/");
  });

  it("menampilkan detail post lengkap untuk pemilik", () => {
    render(<DetailPage params={makeParams()} />);
    expect(screen.getByRole("heading", { name: "Judul Post" })).toBeInTheDocument();
    expect(screen.getByText("Isi konten post")).toBeInTheDocument();
    expect(screen.getByText("Dimas")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Judul Post" })).toHaveAttribute(
      "src",
      "http://img.test/cover.png"
    );
    expect(screen.getByRole("button", { name: /Ubah Cover/i })).toBeInTheDocument();
  });

  it("membuka modal cover, menutup, dan refresh detail saat sukses", () => {
    render(<DetailPage params={makeParams()} />);
    fireEvent.click(screen.getByRole("button", { name: /Ubah Cover/i }));
    expect(screen.getByTestId("cover-modal")).toHaveAttribute("data-post", "10");

    vi.clearAllMocks();
    fireEvent.click(screen.getByText("success-cover"));
    expect(fetchPostDetail).toHaveBeenCalledWith("10");

    fireEvent.click(screen.getByText("close-cover"));
    expect(screen.queryByTestId("cover-modal")).not.toBeInTheDocument();
  });

  it("tidak menampilkan tombol ubah cover untuk non-pemilik", () => {
    setState({ auth: { user: { id: 99 } } });
    render(<DetailPage params={makeParams()} />);
    expect(screen.queryByRole("button", { name: /Ubah Cover/i })).not.toBeInTheDocument();
  });

  it("pemilik tanpa cover melihat tombol tambah gambar sampul", () => {
    setState({ posts: { selectedPost: { ...basePost, cover: null } } });
    render(<DetailPage params={makeParams()} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Tambah Gambar Sampul/i }));
    expect(screen.getByTestId("cover-modal")).toBeInTheDocument();
  });

  it("non-pemilik tanpa cover tidak melihat tombol apa pun untuk cover", () => {
    setState({
      posts: { selectedPost: { ...basePost, cover: null } },
      auth: { user: { id: 99 } },
    });
    render(<DetailPage params={makeParams()} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("menampilkan pesan gagal saat gambar cover error", () => {
    render(<DetailPage params={makeParams()} />);
    fireEvent.error(screen.getByRole("img", { name: "Judul Post" }));
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Cover gagal dimuat, ganti gambar/i })
    ).toBeInTheDocument();
  });

  it("memakai 'Anonim' dan mengosongkan tanggal yang tidak valid", () => {
    setState({
      posts: { selectedPost: { ...basePost, user: null, created_at: "bukan-tanggal" } },
    });
    render(<DetailPage params={makeParams()} />);
    expect(screen.getByText("Anonim")).toBeInTheDocument();
  });
});