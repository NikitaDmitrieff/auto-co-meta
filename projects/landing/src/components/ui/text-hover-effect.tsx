"use client";
import React, { useRef, useEffect, useState, useId } from "react";
import { motion } from "motion/react";

export const TextHoverEffect = ({
  text,
  duration,
  textSize = "text-7xl",
}: {
  text: string;
  duration?: number;
  automatic?: boolean;
  textSize?: string;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });
  const id = useId();

  const gradientId = `textGradient-${id}`;
  const maskId = `revealMask-${id}`;
  const textMaskId = `textMask-${id}`;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursor({ x: e.clientX, y: e.clientY });
      setHovered(true);
    };
    const handleMouseLeave = () => setHovered(false);

    window.addEventListener("mousemove", handleMouseMove);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    if (svgRef.current && cursor.x !== null && cursor.y !== null) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100;
      const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100;
      setMaskPosition({ cx: `${cxPercentage}%`, cy: `${cyPercentage}%` });
    }
  }, [cursor]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 550 80"
      xmlns="http://www.w3.org/2000/svg"
      className="select-none"
    >
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          cx="50%"
          cy="50%"
          r="25%"
        >
          {hovered && (
            <>
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#f97316" />
            </>
          )}
        </linearGradient>

        <motion.radialGradient
          id={maskId}
          gradientUnits="userSpaceOnUse"
          r="80%"
          initial={{ cx: "50%", cy: "50%" }}
          animate={maskPosition}
          transition={{ duration: duration ?? 0, ease: "easeOut" }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>

        <mask id={textMaskId}>
          <rect x="0" y="0" width="100%" height="100%" fill={`url(#${maskId})`} />
        </mask>
      </defs>

      {/* Stroke-draw animation — draws the outline over 4s */}
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.5"
        className={`fill-transparent stroke-white font-[helvetica] ${textSize} font-bold`}
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{ strokeDashoffset: 0, strokeDasharray: 1000 }}
        transition={{ duration: 4, ease: "easeInOut" }}
      >
        {text}
      </motion.text>

      {/* Orange accent — only visible on hover, follows cursor */}
      {hovered && (
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          stroke={`url(#${gradientId})`}
          strokeWidth="0.5"
          mask={`url(#${textMaskId})`}
          className={`fill-transparent font-[helvetica] ${textSize} font-bold`}
        >
          {text}
        </text>
      )}
    </svg>
  );
};
