import { NextResponse } from "next/server";
import state from "@/data";

export function GET() {
  return NextResponse.json({
    status: "ok",
    cycle: state.cycle,
    phase: state.phase,
    generatedAt: state.generatedAt,
  });
}
