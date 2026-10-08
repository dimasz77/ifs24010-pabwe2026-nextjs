import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProfilePage from "@/features/users/pages/ProfilePage";
import { updateProfile, updatePassword } from "@/features/users/api/userApi";
import { fetchMe } from "@/features/auth/states/authSlice";

const { dispatch, mockState } = vi.hoisted(() => ({
  dispatch: vi.fn(),
  mockState: { current: {} as any },
}));

vi.mock("@/hooks/redux", () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (selector: any) => selector(mockState.current),
}));

vi.mock("@/features/users/api/userApi", () => ({
  updateProfile: vi.fn(),
  updatePassword: vi.fn(),
}));

vi.mock("@/features/auth/states/authSlice", () => ({
  fetchMe: vi.fn(() => ({ type: "auth/fetchMe" })),
}));

const setUser = (user: any) => {
  mockState.current = { auth: { user } };
};

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setUser({ id: 1, name: "Dimas", bio: "Mahasiswa" });
  });

  it("mengisi form dengan data user", () => {
    render(<ProfilePage />);
    expect(screen.getByLabelText("Nama")).toHaveValue("Dimas");
    expect(screen.getByLabelText("Bio")).toHaveValue("Mahasiswa");
  });

  it("form kosong saat user belum ada", () => {
    setUser(null);
    render(<ProfilePage />);
    expect(screen.getByLabelText("Nama")).toHaveValue("");
    expect(screen.getByLabelText("Bio")).toHaveValue("");
  });

  it("form kosong jika name dan bio user kosong", () => {
    setUser({ id: 1, name: null, bio: null });
    render(<ProfilePage />);
    expect(screen.getByLabelText("Nama")).toHaveValue("");
    expect(screen.getByLabelText("Bio")).toHaveValue("");
  });

  it("menyinkronkan form saat data user berubah", () => {
    setUser(null);
    const { rerender } = render(<ProfilePage />);
    setUser({ id: 1, name: "Nama Baru", bio: "Bio Baru" });
    rerender(<ProfilePage />);
    expect(screen.getByLabelText("Nama")).toHaveValue("Nama Baru");
    expect(screen.getByLabelText("Bio")).toHaveValue("Bio Baru");
  });

  it("berhasil memperbarui profil", async () => {
    vi.mocked(updateProfile).mockResolvedValue(undefined as any);
    render(<ProfilePage />);
    fireEvent.change(screen.getByLabelText("Nama"), { target: { value: "Dimas Baru" } });
    fireEvent.change(screen.getByLabelText("Bio"), { target: { value: "Bio edit" } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan Profil" }));

    expect(await screen.findByText("Profil berhasil diperbarui!")).toBeInTheDocument();
    expect(updateProfile).toHaveBeenCalledWith({ name: "Dimas Baru", bio: "Bio edit" });
    expect(fetchMe).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({ type: "auth/fetchMe" });
  });

  it("menampilkan pesan error saat gagal memperbarui profil", async () => {
    vi.mocked(updateProfile).mockRejectedValue(new Error("Server error"));
    render(<ProfilePage />);
    fireEvent.click(screen.getByRole("button", { name: "Simpan Profil" }));
    expect(await screen.findByText("Server error")).toBeInTheDocument();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("memakai pesan default saat error profil tanpa message", async () => {
    vi.mocked(updateProfile).mockRejectedValue(new Error(""));
    render(<ProfilePage />);
    fireEvent.click(screen.getByRole("button", { name: "Simpan Profil" }));
    expect(await screen.findByText("Gagal memperbarui profil")).toBeInTheDocument();
  });

  it("berhasil mengubah kata sandi dan mengosongkan field", async () => {
    vi.mocked(updatePassword).mockResolvedValue(undefined as any);
    render(<ProfilePage />);
    fireEvent.change(screen.getByLabelText("Kata Sandi Lama"), { target: { value: "lama123" } });
    fireEvent.change(screen.getByLabelText("Kata Sandi Baru"), { target: { value: "baru456" } });
    fireEvent.click(screen.getByRole("button", { name: "Ubah Sandi" }));

    expect(await screen.findByText("Kata sandi berhasil diperbarui!")).toBeInTheDocument();
    expect(updatePassword).toHaveBeenCalledWith({
      old_password: "lama123",
      new_password: "baru456",
    });
    await waitFor(() => {
      expect(screen.getByLabelText("Kata Sandi Lama")).toHaveValue("");
      expect(screen.getByLabelText("Kata Sandi Baru")).toHaveValue("");
    });
  });

  it("menampilkan pesan error saat gagal mengubah kata sandi", async () => {
    vi.mocked(updatePassword).mockRejectedValue(new Error("Sandi lama salah"));
    render(<ProfilePage />);
    fireEvent.change(screen.getByLabelText("Kata Sandi Lama"), { target: { value: "x" } });
    fireEvent.change(screen.getByLabelText("Kata Sandi Baru"), { target: { value: "y" } });
    fireEvent.click(screen.getByRole("button", { name: "Ubah Sandi" }));
    expect(await screen.findByText("Sandi lama salah")).toBeInTheDocument();
  });

  it("memakai pesan default saat error sandi tanpa message", async () => {
    vi.mocked(updatePassword).mockRejectedValue(new Error(""));
    render(<ProfilePage />);
    fireEvent.change(screen.getByLabelText("Kata Sandi Lama"), { target: { value: "x" } });
    fireEvent.change(screen.getByLabelText("Kata Sandi Baru"), { target: { value: "y" } });
    fireEvent.click(screen.getByRole("button", { name: "Ubah Sandi" }));
    expect(await screen.findByText("Gagal memperbarui kata sandi")).toBeInTheDocument();
  });
});