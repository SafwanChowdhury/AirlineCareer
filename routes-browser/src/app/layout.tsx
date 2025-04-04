// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Routes Database Browser",
  description: "A web application to browse the airline routes database",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-slate-800 text-white p-4">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">Airline Routes Explorer</h1>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
