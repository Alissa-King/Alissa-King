import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://api.spacexdata.com/v4/launches/upcoming", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch launches" }, { status: res.status });
    }
    const data = await res.json();
    const sorted = [...data].sort(
      (a: { date_utc: string }, b: { date_utc: string }) =>
        new Date(a.date_utc).getTime() - new Date(b.date_utc).getTime()
    );
    return NextResponse.json(sorted.slice(0, 8));
  } catch {
    return NextResponse.json({ error: "Failed to fetch launches" }, { status: 500 });
  }
}
