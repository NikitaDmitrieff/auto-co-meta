"use client";
import {
  useScroll,
  useTransform,
  motion,
  useInView,
} from "motion/react";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

function TimelineItem({ item }: { item: TimelineEntry }) {
  const itemRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(itemRef, { once: true, margin: "-40% 0px -40% 0px" });

  return (
    <div ref={itemRef} className="flex justify-start pt-10 md:pt-40 md:gap-10">
      <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
        <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-black flex items-center justify-center">
          <motion.div
            className="h-4 w-4 rounded-full border p-2"
            animate={
              isInView
                ? { backgroundColor: "rgba(249,115,22,0.9)", borderColor: "rgba(249,115,22,0.6)", boxShadow: "0 0 12px rgba(249,115,22,0.5)" }
                : { backgroundColor: "rgba(38,38,38,1)", borderColor: "rgba(64,64,64,1)", boxShadow: "0 0 0px rgba(249,115,22,0)" }
            }
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <motion.h3
          className="hidden md:block text-xl md:pl-20 md:text-5xl font-bold font-[helvetica]"
          animate={isInView ? { color: "rgba(255,255,255,1)" } : { color: "rgba(115,115,115,1)" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {item.title}
        </motion.h3>
      </div>

      <div className="relative pl-20 pr-4 md:pl-4 w-full">
        <motion.h3
          className="md:hidden block text-2xl mb-4 text-left font-bold font-[helvetica]"
          animate={isInView ? { color: "rgba(255,255,255,1)" } : { color: "rgba(115,115,115,1)" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {item.title}
        </motion.h3>
        {item.content}
      </div>
    </div>
  );
}

export const Timeline = ({
  data,
  title,
  description,
}: {
  data: TimelineEntry[];
  title?: string;
  description?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div className="w-full bg-black font-sans md:px-10" ref={containerRef}>
      <div className="max-w-5xl mx-auto py-20 px-4 md:px-8 lg:px-10">
        {title && (
          <h2 className="text-lg md:text-4xl mb-4 text-white max-w-4xl font-[helvetica] font-bold">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-zinc-500 text-sm md:text-base max-w-sm">{description}</p>
        )}
      </div>
      <div ref={ref} className="relative max-w-5xl mx-auto pb-20">
        {data.map((item, index) => (
          <TimelineItem key={index} item={item} />
        ))}
        <div
          style={{ height: height + "px" }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-800 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{ height: heightTransform, opacity: opacityTransform }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-orange-500 via-orange-400 to-transparent rounded-full"
          />
        </div>
      </div>
    </div>
  );
};
