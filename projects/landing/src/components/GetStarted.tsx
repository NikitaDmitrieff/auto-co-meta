"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion } from "motion/react";
import { CornerFrame } from "@/components/ui/corner-frame";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function GetStarted() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState("loading");
    const { error } = await supabase.from("waitlist_signups").insert({ email, source: "landing" });
    if (error) {
      setState("error");
      setErrorMsg(error.code === "23505" ? "You're already on the list!" : "Something went wrong. Try again.");
    } else {
      setState("success");
    }
  }

  return (
    <section id="waitlist" className="bg-black px-6 py-32 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <p className="text-xs font-semibold text-orange-400 uppercase tracking-widest mb-3">Early access</p>
        <h2 className="text-3xl md:text-5xl font-bold font-[helvetica] text-white mb-4">
          Start your AI company<br />
          <span className="text-zinc-500">in 5 minutes.</span>
        </h2>
        <p className="text-zinc-500 max-w-lg mx-auto text-lg">
          The hosted version is coming soon. Join the waitlist for early-bird pricing and first access.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Waitlist */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <CornerFrame lines className="glass-card p-8">
            <h3 className="text-xl font-bold text-white font-[helvetica] mb-2">Hosted version waitlist</h3>
            <p className="text-zinc-500 text-sm mb-6">No setup. No server. Just your AI company, running.</p>

            {state === "success" ? (
              <div className="text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-[3px] px-4 py-3">
                You&apos;re on the list. We&apos;ll reach out when it&apos;s ready.
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={state === "loading"}
                    className="input-field"
                  />
                  <button
                    type="submit"
                    disabled={state === "loading"}
                    className="btn bg-orange-500 hover:bg-orange-400 text-black font-bold py-3 rounded-[3px] text-sm transition-all disabled:opacity-50"
                  >
                    {state === "loading" ? "Joining..." : "Join the waitlist"}
                  </button>
                </form>
                {state === "error" && <p className="mt-2 text-xs text-red-400">{errorMsg}</p>}
                <p className="mt-3 text-xs text-zinc-600">No spam. Unsubscribe anytime.</p>
              </>
            )}
          </CornerFrame>
        </motion.div>

        {/* GitHub CTA */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-6"
        >
          <div className="glass-card glow-border p-6">
            <div className="flex items-start gap-4">
              <svg className="w-8 h-8 text-white shrink-0 mt-1" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-white font-semibold mb-1 font-[helvetica]">Self-host for free</h3>
                <p className="text-zinc-500 text-sm mb-4 leading-relaxed">
                  Full source code on GitHub. MIT license. Clone, customize, run on your own server.
                </p>
                <a
                  href="https://github.com/NikitaDmitrieff/auto-co-meta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 px-4 py-2 rounded-[3px] text-sm transition-all"
                >
                  View on GitHub
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="text-xs text-zinc-600 text-center">
            Open source. MIT license. No vendor lock-in.
          </div>
        </motion.div>
      </div>
    </section>
  );
}
