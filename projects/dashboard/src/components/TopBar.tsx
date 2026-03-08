"use client";

export default function TopBar() {
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 fixed top-0 left-0 lg:left-56 right-0 z-10">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-slate-900">My AI Company</h1>
        <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5">
          Cycle #104
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-green-500" />
          <span className="text-xs text-slate-500">Running</span>
        </div>
        <span className="text-xs text-slate-400 font-mono">$195.20 total</span>
      </div>
    </header>
  );
}
