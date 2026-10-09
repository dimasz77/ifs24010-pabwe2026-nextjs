import { fireEvent, render, screen, act } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const { dispatch, routerReplace, mockState, fetchMe, logout } = vi.hoisted(() => ({
  dispatch: vi.fn(),
  routerReplace: vi.fn(),
  mockState: { current: { auth: { initialized: false, token: null, user: null } } as any },
  fetchMe: vi.fn(() => ({ type: "auth/fetchMe" })),
  logout: vi.fn(() => ({ type: "auth/logout" })),
}));

vi.mock("@/hooks/redux", () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (selector: (state: unknown) => unknown) => selector(mockState.current),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: routerReplace }) }));
vi.mock("@/features/auth/states/authSlice", () => ({ fetchMe, logout }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import Modal from "@/components/ui/Modal";
import Toast from "@/components/ui/Toast";

describe("shared UI components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    mockState.current = { auth: { initialized: false, token: null, user: null } };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders children before auth is initialized", () => {
    render(<AuthGuard><p>Dashboard</p></AuthGuard>);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(routerReplace).not.toHaveBeenCalled();
    expect(fetchMe).not.toHaveBeenCalled();
  });

  it("redirects initialized sessions without a token", () => {
    mockState.current = { auth: { initialized: true, token: null, user: null } };
    render(<AuthGuard><p>Dashboard</p></AuthGuard>);
    expect(screen.getByRole("status")).toHaveTextContent("Memuat...");
    expect(routerReplace).toHaveBeenCalledWith("/auth/login");
  });

  it("loads the user when a token exists and user is missing", () => {
    mockState.current = { auth: { initialized: true, token: "token", user: null } };
    render(<AuthGuard><p>Dashboard</p></AuthGuard>);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(dispatch).toHaveBeenCalledWith({ type: "auth/fetchMe" });
  });

  it("does not fetch the user when already available", () => {
    mockState.current = {
      auth: { initialized: true, token: "token", user: { id: 1, name: "Ada" } },
    };
    render(<AuthGuard><p>Dashboard</p></AuthGuard>);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("shows profile fallback and dispatches logout", () => {
    render(<Navbar />);
    expect(screen.getByRole("link", { name: "Profil" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Keluar" }));
    expect(dispatch).toHaveBeenCalledWith({ type: "auth/logout" });
  });

  it("shows the signed-in user's profile name", () => {
    mockState.current = { auth: { user: { name: "Ada" } } };
    render(<Navbar />);
    expect(screen.getByRole("link", { name: "Profil Ada" })).toBeInTheDocument();
  });

  it("renders floored, zero, and default skeleton counts", () => {
    const { rerender } = render(<LoadingSkeleton count={2.8} />);
    expect(document.querySelectorAll("output > span[aria-hidden='true']")).toHaveLength(2);
    rerender(<LoadingSkeleton count={-2} />);
    expect(screen.getByText("Memuat konten...")).toBeInTheDocument();
    expect(document.querySelectorAll("output > span[aria-hidden='true']")).toHaveLength(0);
    rerender(<LoadingSkeleton />);
    expect(document.querySelectorAll("output > span[aria-hidden='true']")).toHaveLength(3);
  });

  it("only registers Escape handling while open and removes it on close", () => {
    const onClose = vi.fn();
    const { rerender } = render(<Modal isOpen title="Dialog" onClose={onClose}>Body</Modal>);
    expect(screen.getByRole("dialog", { name: "Dialog" })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Enter" });
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
    rerender(<Modal isOpen={false} title="Dialog" onClose={onClose}>Body</Modal>);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes a modal from its close button", () => {
    const onClose = vi.fn();
    render(<Modal isOpen title="Dialog" onClose={onClose}>Body</Modal>);
    fireEvent.click(screen.getByRole("button", { name: "Tutup dialog" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders success and error toasts and closes after timeout", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    const { rerender } = render(<Toast message="Berhasil" onClose={onClose} />);
    expect(screen.getByText("Berhasil")).toHaveClass("bg-green-600");
    act(() => vi.advanceTimersByTime(3000));
    expect(onClose).toHaveBeenCalledOnce();

    rerender(<Toast message="Gagal" type="error" onClose={onClose} />);
    expect(screen.getByText("Gagal")).toHaveClass("bg-red-600");
    rerender(<Toast message={null} onClose={onClose} />);
    expect(screen.queryByText("Gagal")).not.toBeInTheDocument();
  });
});
