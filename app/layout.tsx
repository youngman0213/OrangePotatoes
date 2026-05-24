import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orange Potatoes",
  description: "강원FC 팬을 위한 비공식 정보 허브"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <Header />
        <main className="mx-auto min-h-screen max-w-6xl px-4 pb-28 pt-6 md:py-8">{children}</main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
