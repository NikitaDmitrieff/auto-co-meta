"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        setErrorMsg(data.error ?? "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Try again.");
    }
  };

  return (
    <section id="waitlist" className="bg-black px-6 py-24">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold text-orange-400 uppercase tracking-widest mb-3">
            Early Access
          </p>
          <h2 className="text-3xl md:text-5xl font-bold font-[helvetica] text-white mb-4">
            Your AI company,{" "}
            <span className="text-zinc-500">fully hosted.</span>
          </h2>
          <p className="text-zinc-500 text-lg mb-10 max-w-xl mx-auto">
            Join the waitlist for the hosted version — zero setup, Telegram alerts, and a dashboard like the one above. $49/mo at launch.
          </p>

          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-[6px] px-8 py-5"
              >
                <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <div className="text-left">
                  <div className="text-emerald-400 font-semibold text-sm">You&apos;re on the list</div>
                  <div className="text-zinc-500 text-xs mt-0.5">We&apos;ll email you when hosted launches.</div>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  disabled={status === "loading"}
                  className="flex-1 w-full bg-white/[0.04] border border-white/10 text-white placeholder-zinc-600 rounded-[3px] px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.06] transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full sm:w-auto flex-shrink-0 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-black font-bold px-6 py-3 rounded-[3px] text-sm transition-colors whitespace-nowrap"
                >
                  {status === "loading" ? "Joining…" : "Join waitlist"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {status === "error" && (
            <p className="text-red-400 text-xs mt-3">{errorMsg}</p>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-700">
            {["No spam, ever", "Cancel anytime", "Founding member pricing"].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <svg className="w-3 h-3 text-orange-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
