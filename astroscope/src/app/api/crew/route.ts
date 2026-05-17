import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://api.open-notify.org/astros.json", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch crew data" }, { status: res.status });
    }
    const data = await res.json();
    const issCrew = (data.people as Array<{ name: string; craft: string }>).filter(
      (p) => p.craft === "ISS"
    );
    return NextResponse.json({ crew: issCrew, total: issCrew.length });
  } catch {
    return NextResponse.json({ error: "Failed to fetch crew data" }, { status: 500 });
  }
}
