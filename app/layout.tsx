import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = { title: "Catálogo de filmes" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
