// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { PilotProvider } from "@/lib/contexts/pilot-context";
import { PilotSelect } from "@/components/career/PilotSelect";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Airline Routes Browser",
  description: "Browse and explore airline routes worldwide",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PilotProvider>
          <nav className="bg-slate-800 text-white p-4">
            <div className="container mx-auto flex items-center justify-between">
              <h1 className="text-2xl font-bold">Airline Routes Explorer</h1>
              <PilotSelect />
            </div>
          </nav>
          {children}
          <Toaster />
        </PilotProvider>
      </body>
    </html>
  );
}
