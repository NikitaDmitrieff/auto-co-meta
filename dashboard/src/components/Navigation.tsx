'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'COMMAND', key: 'cmd' },
  { href: '/agents', label: 'AGENTS', key: 'agents' },
  { href: '/cycles', label: 'CYCLES', key: 'cycles' },
  { href: '/artifacts', label: 'ARTIFACTS', key: 'artifacts' },
  { href: '/metrics', label: 'METRICS', key: 'metrics' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b-3 border-white bg-surface">
      <div className="flex items-stretch">
        {/* Logo / Brand */}
        <div className="border-r-3 border-white px-4 py-3 flex items-center gap-2">
          <span className="text-accent-green font-extrabold text-lg tracking-tighter">
            AUTO
          </span>
          <span className="text-accent-pink font-extrabold text-lg tracking-tighter">
            CO
          </span>
          <span className="text-fg text-xs opacity-50 ml-1">v0.1</span>
        </div>

        {/* Nav Links */}
        <div className="flex items-stretch">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`
                  border-r-3 border-white px-5 py-3 text-xs font-bold tracking-widest
                  transition-all duration-100 flex items-center
                  ${isActive
                    ? 'bg-accent-green text-bg'
                    : 'text-fg hover:bg-surface-hover hover:text-accent-green'
                  }
                `}
              >
                {'>'} {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right side - status */}
        <div className="ml-auto flex items-center px-4 gap-3">
          <span className="text-xs text-fg opacity-50">SYS</span>
          <span className="status-dot status-active blink" />
          <span className="text-xs text-accent-green">ONLINE</span>
        </div>
      </div>
    </nav>
  );
}
