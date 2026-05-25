import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orange Potatoes",
  description: "Orange Potatoes - \uac15\uc6d0FC \ud32c\uc744 \uc704\ud55c \ube44\uacf5\uc2dd \uc815\ubcf4 \ud5c8\ube0c"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <Header />
        <main className="mx-auto min-h-screen max-w-6xl px-4 pb-20 pt-6 md:py-8">{children}</main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
