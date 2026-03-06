import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'AUTO-CO // Mission Control',
  description: 'Neo-brutalist monitoring dashboard for the autonomous AI company',
};

// Revalidate every 5 seconds to pick up file changes
export const revalidate = 5;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bg text-fg min-h-screen grid-bg">
        {/* Top bar - system info */}
        <div className="border-b border-white/10 px-4 py-1 flex items-center justify-between text-xs opacity-40">
          <span>AUTO-CO MISSION CONTROL v0.1.0</span>
          <span className="flex items-center gap-4">
            <span>PID:-</span>
            <span>MEM:OK</span>
            <span>NET:UP</span>
          </span>
        </div>

        <Navigation />

        <main className="p-4 max-w-[1800px] mx-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 px-4 py-2 text-xs opacity-20 flex items-center justify-between mt-8">
          <span>// auto-co dashboard // 14 agents // autonomous operations</span>
          <span>
            {'['} <span className="text-accent-green">SYS</span> {']'}{' '}
            {'['} <span className="text-accent-blue">NET</span> {']'}{' '}
            {'['} <span className="text-accent-pink">FS</span> {']'}
          </span>
        </footer>
      </body>
    </html>
  );
}
