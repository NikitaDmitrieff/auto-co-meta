import type { Metadata } from "next";
import "./globals.css";
import Analytics from "@/components/Analytics";

export const metadata: Metadata = {
  title: "Auto-Co — Ship Your AI Company in a Day",
  description:
    "Auto-Co is an open-source framework for running a fully autonomous AI company: 14 AI agents, a 24/7 work loop, and zero human involvement in daily decisions.",
  openGraph: {
    title: "Auto-Co — Ship Your AI Company in a Day",
    description:
      "14 AI agents. 24/7 autonomous loop. Zero daily supervision. Run your own AI company.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Analytics />
        {children}
      </body>
    </html>
  );
}
