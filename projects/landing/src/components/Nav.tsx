"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import Image from "next/image";

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // Hide Nav on demo page — it has its own chrome
  if (pathname === "/demo") return null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-md bg-black/70 border-b border-white/10 shadow-lg shadow-black/40"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group">
          <Image src="/logo-ac.png" alt="auto-co" width={28} height={20} className="opacity-90 group-hover:opacity-100 transition-opacity" />
        </a>

        {/* Links */}
        <div className="hidden sm:flex items-center gap-6 text-xs text-zinc-500">
          <a href="/#features" className="hover:text-zinc-200 transition-colors">Features</a>
          <a href="/demo" className="hover:text-zinc-200 transition-colors">Live Demo</a>
          <a href="/pricing" className="hover:text-zinc-200 transition-colors">Pricing</a>
          <a href="/blog" className="hover:text-zinc-200 transition-colors">Blog</a>
          <a
            href="https://github.com/NikitaDmitrieff/auto-co-meta"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-200 transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            GitHub
          </a>
        </div>

        {/* CTA */}
        <a
          href="/#waitlist"
          className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-400 text-black font-bold px-4 py-1.5 text-xs transition-all"
        >
          Start free
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>
    </motion.nav>
  );
}
