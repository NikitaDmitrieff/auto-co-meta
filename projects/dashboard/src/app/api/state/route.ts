import { NextResponse } from "next/server";
import state from "@/data";

export function GET() {
  return NextResponse.json(state, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
