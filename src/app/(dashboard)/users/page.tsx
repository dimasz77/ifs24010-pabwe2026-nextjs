"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchUsers } from "@/features/users/states/userSlice";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const { users, isLoading } = useAppSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Daftar Anggota</h1>
        <p className="text-slate-400 text-sm">Pengguna aktif yang terdaftar di platform</p>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => (
            <div
              key={u.id}
              className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4 hover:border-slate-600 transition"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-300 text-lg">
                {u.name ? u.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-semibold text-slate-200 truncate">{u.name}</h3>
                <p className="text-slate-400 text-xs truncate">{u.email}</p>
                {u.bio && <p className="text-slate-500 text-xs mt-1 truncate">{u.bio}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}