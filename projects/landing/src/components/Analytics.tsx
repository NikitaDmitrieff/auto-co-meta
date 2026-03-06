"use client";

import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Analytics() {
  useEffect(() => {
    supabase.from("page_views").insert({
      path: window.location.pathname,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
    });
  }, []);

  return null;
}
