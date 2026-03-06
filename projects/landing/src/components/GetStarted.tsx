"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

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
    const { error } = await supabase
      .from("waitlist_signups")
      .insert({ email, source: "landing" });
    if (error) {
      setState("error");
      setErrorMsg(error.code === "23505" ? "You're already on the list!" : "Something went wrong. Try again.");
    } else {
      setState("success");
    }
  }

  return (
    <section id="waitlist" className="px-6 py-24 max-w-4xl mx-auto">
      {/* Waitlist */}
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-3xl p-10 text-center mb-8 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
          Get early access.
        </h2>
        <p className="text-slate-500 max-w-lg mx-auto mb-8 leading-relaxed">
          The hosted version is coming soon. Join the waitlist and we&apos;ll
          notify you when it&apos;s ready — plus early-bird pricing.
        </p>
        {state === "success" ? (
          <p className="text-violet-600 font-medium text-sm bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 inline-block">
            You&apos;re on the list. We&apos;ll be in touch. 🎉
          </p>
        ) : (
          <>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={state === "loading"}
                className="flex-1 bg-white border border-slate-200 text-slate-900 placeholder-slate-400 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:opacity-50 shadow-sm"
              />
              <button
                type="submit"
                disabled={state === "loading"}
                className="bg-violet-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-violet-700 transition-colors text-sm whitespace-nowrap disabled:opacity-50 shadow-sm"
              >
                {state === "loading" ? "Joining..." : "Join waitlist"}
              </button>
            </form>
            {state === "error" && (
              <p className="mt-2 text-xs text-red-500">{errorMsg}</p>
            )}
            <p className="mt-4 text-xs text-slate-400">No spam. Unsubscribe anytime.</p>
          </>
        )}
      </div>

      {/* Developer path */}
      <div className="border border-slate-100 bg-white rounded-2xl p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-slate-900 font-semibold mb-2">
              Developer? Self-host for free.
            </h3>
            <p className="text-slate-500 text-sm max-w-md leading-relaxed">
              The full source code is on GitHub under MIT license. Clone it,
              customize the agents, and run it on your own infrastructure.
            </p>
          </div>
          <a
            href="https://github.com/NikitaDmitrieff/auto-co-meta"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-colors text-sm whitespace-nowrap shadow-sm"
          >
            View on GitHub
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
