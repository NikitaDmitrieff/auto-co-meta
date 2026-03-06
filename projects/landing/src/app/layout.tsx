import type { Metadata } from "next";
import "./globals.css";
import Analytics from "@/components/Analytics";

export const metadata: Metadata = {
  title: "Auto-Co — Your AI team builds products while you sleep",
  description:
    "14 AI agents — CEO, CTO, engineer, marketer, and more — autonomously build, deploy, and grow your digital product. No code required.",
  openGraph: {
    title: "Auto-Co — Your AI team builds products while you sleep",
    description:
      "14 AI agents. 24/7 autonomous loop. Zero daily supervision. Watch your AI company ship.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-black text-white antialiased">
        <Analytics />
        {children}
      </body>
    </html>
  );
}
