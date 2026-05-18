import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora"
});

export const metadata: Metadata = {
  title: "ScoppiaBET 2026",
  description: "Bolao profissional da Copa do Mundo 2026."
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <body className={sora.variable} style={{ fontFamily: "var(--font-sora), sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
