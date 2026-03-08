import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export const metadata: Metadata = {
  title: "Auto-Co Dashboard",
  description: "Control and monitor your autonomous AI company.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Sidebar />
        <TopBar />
        <main className="lg:ml-56 mt-14 p-4 lg:p-6 min-h-screen bg-white">
          {children}
        </main>
      </body>
    </html>
  );
}
