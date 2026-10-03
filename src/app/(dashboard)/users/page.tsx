"use client";

import { useEffect, useState } from "react";
import { getUsers } from "@/features/users/api/userApi";
import { User } from "@/features/users/states/userSlice";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        setLoading(true);
        const res = await getUsers();
        setUsers(res.data);
      } catch (err: unknown) {
        const errorObj = err as Error;
        setError(errorObj.message || "Gagal mengambil data pengguna");
      } finally {
        setLoading(false);
      }
    };

    fetchUsersData();
  }, []);

  if (loading) {
    return <div className="p-6 text-slate-400">Memuat daftar pengguna...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-400">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Daftar Pengguna</h1>
        <p className="text-slate-400 text-sm">Kelola dan lihat seluruh anggota platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u: User) => (
          <div key={u.id} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 shadow">
            <h2 className="font-semibold text-slate-100">{u.name}</h2>
            <p className="text-slate-300 text-sm mt-2">{u.bio || "Belum ada bio."}</p>
          </div>
        ))}
      </div>
    </div>
  );
}