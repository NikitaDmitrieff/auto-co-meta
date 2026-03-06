"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function BackgroundBeams({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className
      )}
    >
      <svg
        className="absolute w-full h-full"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="beam1" cx="20%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="beam2" cx="80%" cy="70%" r="50%">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="beam3" cx="50%" cy="10%" r="40%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="line1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0" />
            <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="line2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0" />
            <stop offset="50%" stopColor="#4f46e5" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Ambient glow orbs */}
        <rect width="1440" height="900" fill="url(#beam1)" />
        <rect width="1440" height="900" fill="url(#beam2)" />
        <rect width="1440" height="900" fill="url(#beam3)" />

        {/* Beam lines */}
        <line x1="-100" y1="200" x2="1540" y2="700" stroke="url(#line1)" strokeWidth="1" opacity="0.5" />
        <line x1="-100" y1="400" x2="1540" y2="100" stroke="url(#line2)" strokeWidth="0.8" opacity="0.4" />
        <line x1="200" y1="-50" x2="1200" y2="950" stroke="url(#line1)" strokeWidth="0.6" opacity="0.3" />
        <line x1="600" y1="-50" x2="800" y2="950" stroke="url(#line2)" strokeWidth="0.5" opacity="0.25" />

        {/* Dot grid */}
        {Array.from({ length: 20 }).map((_, i) =>
          Array.from({ length: 12 }).map((_, j) => (
            <circle
              key={`${i}-${j}`}
              cx={i * 80 + 20}
              cy={j * 80 + 20}
              r="0.8"
              fill="#7c3aed"
              opacity={Math.random() * 0.3 + 0.05}
            />
          ))
        )}
      </svg>
    </div>
  );
}
