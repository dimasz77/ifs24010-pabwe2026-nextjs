import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { preconnect } from "react-dom";
import Providers from "@/components/Providers";
import { API_BASE_URL } from "@/lib/config";
import "./globals.css"; // Gunakan path relative ./globals.css

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "DelcomFeed - Praktikum PABWE 2026",
  description: "Aplikasi Publikasi & Diskusi Mahasiswa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Buka koneksi ke server API lebih awal (DNS + TLS) agar fetch data pertama lebih cepat -> LCP membaik
  try {
    preconnect(new URL(API_BASE_URL).origin, { crossOrigin: "anonymous" });
  } catch {
    /* abaikan bila URL tidak valid */
  }

  return (
    <html lang="id">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}