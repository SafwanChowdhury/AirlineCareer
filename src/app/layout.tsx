// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { PilotProvider } from "@/lib/contexts/pilot-context";
import { PilotSelect } from "@/components/career/PilotSelect";
import { ErrorBoundary } from "@/components/error-boundary/ErrorBoundary";
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
        <ErrorBoundary>
          <PilotProvider>
            <div className="min-h-screen bg-background">
              <header className="border-b">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                  <nav className="flex items-center space-x-6">
                    <Link href="/" className="font-semibold text-lg">
                      Routes Browser
                    </Link>
                    <Link href="/routes" className="flex items-center gap-2">
                      <Map className="w-4 h-4" />
                      Routes
                    </Link>
                    <Link href="/career" className="flex items-center gap-2">
                      <Plane className="w-4 h-4" />
                      Career
                    </Link>
                  </nav>
                  <div className="flex items-center space-x-4">
                    <PilotSelect />
                  </div>
                </div>
              </header>
              <main>
                <ErrorBoundary>{children}</ErrorBoundary>
              </main>
            </div>
            <Toaster />
          </PilotProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
