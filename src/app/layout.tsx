import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PayEvo — Gateway",
  description: "Desafio Técnico Fullstack",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-black text-white`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
