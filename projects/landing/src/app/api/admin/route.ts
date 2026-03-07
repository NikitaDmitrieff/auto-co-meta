import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "auto-co-admin-2026";

export async function POST(req: NextRequest) {
  let password: string;
  try {
    const body = await req.json();
    password = body.password ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch waitlist signups
  const { data: signups, error: signupErr } = await supabase
    .from("waitlist_signups")
    .select("email, source, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  // Fetch page views
  const { data: views, error: viewsErr } = await supabase
    .from("page_views")
    .select("path, referrer, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (signupErr || viewsErr) {
    console.error("Admin query error:", signupErr, viewsErr);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({ signups: signups ?? [], views: views ?? [] });
}
