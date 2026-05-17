import { NextRequest, NextResponse } from "next/server";

const NASA_API_KEY = "DEMO_KEY";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json({ error: "start and end query params required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&start_date=${start}&end_date=${end}&thumbs=true`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) {
      return NextResponse.json({ error: "NASA API error" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch APOD archive" }, { status: 500 });
  }
}
