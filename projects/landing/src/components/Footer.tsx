export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/[0.05] px-6 py-12">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-600">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold font-[helvetica] text-sm">AUTO-CO</span>
          <span>— the autonomous AI company OS</span>
        </div>
        <div className="flex gap-6">
          <a href="https://github.com/NikitaDmitrieff/auto-co-meta" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">GitHub</a>
          <span>MIT License</span>
          <span>2026</span>
        </div>
      </div>
    </footer>
  );
}
