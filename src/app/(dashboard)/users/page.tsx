import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold mb-4">Selamat Datang di DelcomFeed</h1>
      <p className="text-slate-400 max-w-md mb-8">
        Platform berbagi informasi dan postingan komunitas Delcom.
      </p>

      <div className="flex gap-4">
        <Link
          href="/auth/login"
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium transition"
        >
          Masuk
        </Link>
        <Link
          href="/auth/register"
          className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-medium transition"
        >
          Daftar
        </Link>
      </div>
    </div>
  );
}