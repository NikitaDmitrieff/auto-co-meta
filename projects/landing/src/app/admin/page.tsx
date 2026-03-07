"use client";

import { useState } from "react";

interface Signup {
  email: string;
  source: string;
  created_at: string;
}

interface PageView {
  path: string;
  referrer: string | null;
  created_at: string;
}

interface AdminData {
  signups: Signup[];
  views: PageView[];
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError(res.status === 401 ? "Wrong password" : "Server error");
        return;
      }
      setData(await res.json());
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
          <h1 className="text-lg font-bold text-white text-center">Admin</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-orange-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-black font-bold text-sm rounded transition-colors disabled:opacity-50"
          >
            {loading ? "Loading..." : "Enter"}
          </button>
          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
        </form>
      </div>
    );
  }

  const { signups, views } = data;

  // Compute daily signups
  const signupsByDay = signups.reduce<Record<string, number>>((acc, s) => {
    const day = s.created_at?.slice(0, 10) ?? "unknown";
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  // Compute top referrers
  const referrerCounts = views.reduce<Record<string, number>>((acc, v) => {
    const ref = v.referrer || "(direct)";
    acc[ref] = (acc[ref] || 0) + 1;
    return acc;
  }, {});
  const topReferrers = Object.entries(referrerCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15);

  // Compute page view counts
  const pathCounts = views.reduce<Record<string, number>>((acc, v) => {
    acc[v.path] = (acc[v.path] || 0) + 1;
    return acc;
  }, {});
  const topPages = Object.entries(pathCounts)
    .sort(([, a], [, b]) => b - a);

  // Daily views
  const viewsByDay = views.reduce<Record<string, number>>((acc, v) => {
    const day = v.created_at?.slice(0, 10) ?? "unknown";
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  const maxDailyViews = Math.max(...Object.values(viewsByDay), 1);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">auto-co admin</h1>
          <a href="/" className="text-xs text-zinc-500 hover:text-zinc-300">&larr; Back to site</a>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card label="Waitlist signups" value={signups.length} />
          <Card label="Page views" value={views.length} />
          <Card label="Unique referrers" value={Object.keys(referrerCounts).length} />
          <Card label="Pages tracked" value={Object.keys(pathCounts).length} />
        </div>

        {/* Daily views bar chart */}
        <Section title="Page views by day">
          <div className="space-y-1">
            {Object.entries(viewsByDay)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([day, count]) => (
                <div key={day} className="flex items-center gap-3 text-xs">
                  <span className="text-zinc-500 w-24 flex-shrink-0 font-mono">{day}</span>
                  <div className="flex-1 h-4 bg-zinc-900 rounded overflow-hidden">
                    <div
                      className="h-full bg-orange-500/70 rounded"
                      style={{ width: `${(count / maxDailyViews) * 100}%` }}
                    />
                  </div>
                  <span className="text-zinc-400 w-10 text-right font-mono">{count}</span>
                </div>
              ))}
          </div>
        </Section>

        {/* Signups by day */}
        <Section title="Signups by day">
          {Object.keys(signupsByDay).length === 0 ? (
            <p className="text-xs text-zinc-600">No signups yet</p>
          ) : (
            <div className="space-y-1">
              {Object.entries(signupsByDay)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([day, count]) => (
                  <div key={day} className="flex items-center gap-3 text-xs">
                    <span className="text-zinc-500 w-24 flex-shrink-0 font-mono">{day}</span>
                    <span className="text-white font-mono">{count}</span>
                  </div>
                ))}
            </div>
          )}
        </Section>

        {/* Top referrers */}
        <Section title="Top referrers">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-zinc-600 border-b border-white/5">
                <th className="text-left py-2 font-medium">Referrer</th>
                <th className="text-right py-2 font-medium w-16">Views</th>
              </tr>
            </thead>
            <tbody>
              {topReferrers.map(([ref, count]) => (
                <tr key={ref} className="border-b border-white/[0.03]">
                  <td className="py-2 text-zinc-300 break-all">{ref}</td>
                  <td className="py-2 text-right text-zinc-400 font-mono">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* Top pages */}
        <Section title="Page views by path">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-zinc-600 border-b border-white/5">
                <th className="text-left py-2 font-medium">Path</th>
                <th className="text-right py-2 font-medium w-16">Views</th>
              </tr>
            </thead>
            <tbody>
              {topPages.map(([path, count]) => (
                <tr key={path} className="border-b border-white/[0.03]">
                  <td className="py-2 text-zinc-300 font-mono">{path}</td>
                  <td className="py-2 text-right text-zinc-400 font-mono">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* Recent signups */}
        <Section title="Recent signups">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-zinc-600 border-b border-white/5">
                <th className="text-left py-2 font-medium">Email</th>
                <th className="text-left py-2 font-medium">Source</th>
                <th className="text-right py-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {signups.slice(0, 50).map((s, i) => (
                <tr key={i} className="border-b border-white/[0.03]">
                  <td className="py-2 text-zinc-300">{s.email}</td>
                  <td className="py-2 text-zinc-500">{s.source}</td>
                  <td className="py-2 text-right text-zinc-500 font-mono">
                    {s.created_at?.slice(0, 16).replace("T", " ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-zinc-900/50 p-4">
      <p className="text-2xl font-bold text-orange-400">{value}</p>
      <p className="text-xs text-zinc-500 mt-1">{label}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-zinc-900/30 p-5">
      <h2 className="text-sm font-semibold text-zinc-300 mb-4">{title}</h2>
      {children}
    </div>
  );
}
