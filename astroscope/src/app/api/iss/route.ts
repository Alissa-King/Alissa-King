import { fetchISSPosition } from "@/lib/nasa";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const position = await fetchISSPosition();
    return NextResponse.json(position);
  } catch {
    return NextResponse.json({ error: "Failed to fetch ISS position" }, { status: 502 });
  }
}
