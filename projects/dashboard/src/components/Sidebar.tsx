"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: DashboardIcon },
  { href: "/live", label: "Live", icon: LiveIcon },
  { href: "/team", label: "Team", icon: TeamIcon },
  { href: "/finance", label: "Finance", icon: FinanceIcon },
  { href: "/github", label: "GitHub", icon: GitHubIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-56 h-screen bg-white border-r border-slate-200 flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-accent flex items-center justify-center">
            <span className="text-white text-xs font-bold font-mono">AC</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">auto-co</div>
            <div className="text-[10px] text-slate-400 font-mono">v1.1.1</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors mb-0.5 ${
                isActive
                  ? "bg-accent/10 text-accent border-l-2 border-accent -ml-px"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-l-2 border-transparent -ml-px"
              }`}
            >
              <item.icon active={isActive} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-200">
        <div className="text-[10px] text-slate-400 font-mono">Cycle #104</div>
        <div className="text-[10px] text-slate-400">Running</div>
      </div>
    </aside>
  );
}

function DashboardIcon({ active }: { active: boolean }) {
  const color = active ? "#f97316" : "#94a3b8";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" stroke={color} strokeWidth="1.5" />
      <rect x="9" y="1" width="6" height="6" stroke={color} strokeWidth="1.5" />
      <rect x="1" y="9" width="6" height="6" stroke={color} strokeWidth="1.5" />
      <rect x="9" y="9" width="6" height="6" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function LiveIcon({ active }: { active: boolean }) {
  const color = active ? "#f97316" : "#94a3b8";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3" fill={color} />
      <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" fill="none" opacity="0.4" />
    </svg>
  );
}

function TeamIcon({ active }: { active: boolean }) {
  const color = active ? "#f97316" : "#94a3b8";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="2.5" stroke={color} strokeWidth="1.5" />
      <path d="M3 14c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke={color} strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function FinanceIcon({ active }: { active: boolean }) {
  const color = active ? "#f97316" : "#94a3b8";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="9" width="3" height="5" stroke={color} strokeWidth="1.5" />
      <rect x="6.5" y="5" width="3" height="9" stroke={color} strokeWidth="1.5" />
      <rect x="11" y="2" width="3" height="12" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function GitHubIcon({ active }: { active: boolean }) {
  const color = active ? "#f97316" : "#94a3b8";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill={color}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}
