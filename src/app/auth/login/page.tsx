"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchApi, setToken } from "@/helpers/apiHelper";

export default function LoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState(""); // Bisa diisi Username atau Email
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      // Mengirimkan kombinasi field agar cocok dengan kebutuhan API Delcom
      const res = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username: identifier.trim(),
          email: identifier.trim(),
          password: password,
          kata_sandi: password,
        }),
      });

      if (res.data?.token) {
        setToken(res.data.token);
      }

      router.push("/posts");
    } catch (err: unknown) {
      const errorObj = err as Error;
      setErrorMessage(errorObj.message || "Gagal melakukan login. Periksa kembali kredensial Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-slate-100 text-center mb-2">Masuk ke Akun</h1>
        <p className="text-sm text-slate-400 text-center mb-6">
          Masukkan kredensial Anda untuk melanjutkan
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Username / Email
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
              placeholder="Username atau Email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Kata Sandi</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition mt-2"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Belum punya akun?{" "}
          <Link
            href="/auth/register"
            className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-4 transition"
          >
            Buat akun
          </Link>
        </div>
      </div>
    </div>
  );
}