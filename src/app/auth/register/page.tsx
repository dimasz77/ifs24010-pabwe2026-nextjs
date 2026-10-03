"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchApi } from "@/helpers/apiHelper";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validasi panjang kata sandi di sisi client
    if (password.length < 8) {
      setErrorMessage("Kata sandi harus minimal 8 karakter.");
      return;
    }

    setLoading(true);

    try {
      await fetchApi("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password,
          kata_sandi: password,
        }),
      });
      router.push("/auth/login");
    } catch (err: unknown) {
      const errorObj = err as Error;
      setErrorMessage(errorObj.message || "Gagal melakukan pendaftaran. Pastikan data benar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-slate-100 text-center mb-2">Buat Akun Baru</h1>
        <p className="text-sm text-slate-400 text-center mb-6">
          Bergabunglah bersama komunitas DelcomFeed
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
              placeholder="Masukkan nama lengkap Anda"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Kata Sandi</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
              placeholder="Minimal 8 karakter (huruf & angka)"
            />
            <p className="text-xs text-slate-500 mt-1">Minimal 8 karakter, kombinasi huruf dan angka.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition mt-2"
          >
            {loading ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Sudah memiliki akun?{" "}
          <Link
            href="/auth/login"
            className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-4 transition"
          >
            Masuk
          </Link>
        </div>
      </div>
    </div>
  );
}