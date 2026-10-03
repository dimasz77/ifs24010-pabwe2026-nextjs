"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchMe } from "@/features/auth/states/authSlice";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token, user, initialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!initialized) return;
    if (!token) {
      router.replace("/auth/login");
    } else if (!user) {
      dispatch(fetchMe());
    }
  }, [initialized, token, user, router, dispatch]);

  // Render pertama (server & klien) harus identik -> tampilkan kerangka pemuatan
  if (!initialized || !token) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p role="status" aria-busy="true" className="text-slate-400 text-sm">
          Memuat...
        </p>
      </main>
    );
  }

  return <>{children}</>;
}
