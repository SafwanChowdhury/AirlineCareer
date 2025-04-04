// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { PilotProvider } from "@/lib/contexts/pilot-context";
import { PilotSelect } from "@/components/career/PilotSelect";
import Link from "next/link";
import { Plane, Map, Calendar, User } from "lucide-react";

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
          <nav className="bg-slate-900 text-white shadow-lg">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-8">
                  <Link
                    href="/"
                    className="flex items-center space-x-2 hover:text-blue-400 transition-colors"
                  >
                    <Plane className="h-6 w-6" />
                    <h1 className="text-xl font-bold">
                      Airline Routes Explorer
                    </h1>
                  </Link>
                  <div className="hidden md:flex items-center space-x-6">
                    <Link
                      href="/routes"
                      className="flex items-center space-x-2 hover:text-blue-400 transition-colors"
                    >
                      <Map className="h-5 w-5" />
                      <span>Routes</span>
                    </Link>
                    <Link
                      href="/career"
                      className="flex items-center space-x-2 hover:text-blue-400 transition-colors"
                    >
                      <Calendar className="h-5 w-5" />
                      <span>Career</span>
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 hover:text-blue-400 transition-colors"
                    >
                      <User className="h-5 w-5" />
                      <span>Profile</span>
                    </Link>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <PilotSelect />
                </div>
              </div>
            </div>
          </nav>
          <main className="container mx-auto px-4 py-8">{children}</main>
          <Toaster />
        </PilotProvider>
      </body>
    </html>
  );
}
