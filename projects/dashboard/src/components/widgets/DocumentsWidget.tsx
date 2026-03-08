"use client";

const DOCUMENTS = [
  { title: "NanoCorp Competitor Analysis", author: "research-thompson", date: "2026-03-08", type: "research" },
  { title: "CEO Daily Briefing", author: "ceo-bezos", date: "2026-03-07", type: "briefing" },
  { title: "Content Marketing Plan", author: "marketing-godin", date: "2026-03-06", type: "marketing" },
  { title: "Pricing Strategy v2", author: "cfo-campbell", date: "2026-03-05", type: "finance" },
  { title: "Strategic Review — Q1 2026", author: "ceo-bezos", date: "2026-03-05", type: "strategy" },
  { title: "Dashboard Architecture", author: "cto-vogels", date: "2026-03-04", type: "technical" },
  { title: "Distribution Playbook", author: "marketing-godin", date: "2026-03-03", type: "marketing" },
  { title: "Company Mission Statement", author: "ceo-bezos", date: "2026-03-01", type: "strategy" },
];

const TYPE_COLORS: Record<string, string> = {
  research: "bg-cyan-50 text-cyan-600",
  briefing: "bg-purple-50 text-purple-600",
  marketing: "bg-pink-50 text-pink-600",
  finance: "bg-amber-50 text-amber-600",
  strategy: "bg-blue-50 text-blue-600",
  technical: "bg-green-50 text-green-600",
};

export default function DocumentsWidget() {
  return (
    <div className="border border-slate-200">
      <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest">
          Documents
        </h3>
        <span className="text-[10px] font-mono text-slate-400">{DOCUMENTS.length} files</span>
      </div>
      <div className="p-4 space-y-1.5">
        {DOCUMENTS.map((doc, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50 -mx-2 px-2 transition-colors"
          >
            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 uppercase flex-shrink-0 ${
              TYPE_COLORS[doc.type] || "bg-slate-100 text-slate-500"
            }`}>
              {doc.type}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm text-slate-700 truncate">{doc.title}</div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] font-mono text-slate-400">{doc.author.split("-").pop()}</span>
              <span className="text-[10px] font-mono text-slate-300 hidden sm:inline">{doc.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
