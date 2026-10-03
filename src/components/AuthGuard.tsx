"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchMe } from "@/features/auth/states/authSlice";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token, user, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
    } else if (!user) {
      dispatch(fetchMe());
    }
  }, [token, user, router, dispatch]);

  if (!token) return null;

  return <>{children}</>;
}