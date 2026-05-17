const NASA_API_KEY = "DEMO_KEY";
const NASA_BASE = "https://api.nasa.gov";
const IMAGES_BASE = "https://images-api.nasa.gov";

export interface ApodData {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  date: string;
  media_type: "image" | "video";
  copyright?: string;
}

export interface NeoObject {
  id: string;
  name: string;
  nasa_jpl_url: string;
  estimated_diameter: {
    kilometers: { estimated_diameter_min: number; estimated_diameter_max: number };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: Array<{
    close_approach_date: string;
    relative_velocity: { kilometers_per_hour: string };
    miss_distance: { kilometers: string; lunar: string };
  }>;
  absolute_magnitude_h: number;
}

export interface NeoFeedResponse {
  element_count: number;
  near_earth_objects: Record<string, NeoObject[]>;
}

export interface ISSPosition {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  timestamp: number;
}

export interface NasaImageItem {
  nasa_id: string;
  title: string;
  description: string;
  date_created: string;
  center: string;
  keywords?: string[];
  thumbnail: string;
  largeUrl: string;
}

export async function fetchApod(): Promise<ApodData> {
  const res = await fetch(
    `${NASA_BASE}/planetary/apod?api_key=${NASA_API_KEY}&thumbs=true`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) throw new Error("Failed to fetch APOD");
  return res.json();
}

export async function fetchAsteroidFeed(): Promise<NeoFeedResponse> {
  const { connection } = await import("next/server");
  await connection();
  const today = new Date();
  const start = today.toISOString().split("T")[0];
  const end = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const res = await fetch(
    `${NASA_BASE}/neo/rest/v1/feed?start_date=${start}&end_date=${end}&api_key=${NASA_API_KEY}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) throw new Error("Failed to fetch asteroid feed");
  return res.json();
}

export async function fetchISSPosition(): Promise<ISSPosition> {
  const res = await fetch("https://api.wheretheiss.at/v1/satellites/25544", {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch ISS position");
  return res.json();
}

export async function fetchArtemisPhotos(page = 1): Promise<{
  items: NasaImageItem[];
  totalHits: number;
  nextPage?: number;
}> {
  const res = await fetch(
    `${IMAGES_BASE}/search?q=Artemis+II+moon&media_type=image&year_start=2025&page=${page}&page_size=24`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) throw new Error("Failed to fetch Artemis photos");

  const data = await res.json();
  const collection = data.collection;
  const totalHits: number = collection.metadata?.total_hits ?? 0;

  const items: NasaImageItem[] = (collection.items ?? []).map(
    (item: {
      data: Array<{
        nasa_id: string;
        title: string;
        description: string;
        date_created: string;
        center: string;
        keywords?: string[];
      }>;
      links?: Array<{ href: string; rel: string }>;
    }) => {
      const meta = item.data[0];
      const thumbLink = item.links?.find((l) => l.rel === "preview");
      const thumbnail = thumbLink?.href ?? "";
      const largeUrl = `https://images-assets.nasa.gov/image/${meta.nasa_id}/${meta.nasa_id}~large.jpg`;
      return {
        nasa_id: meta.nasa_id,
        title: meta.title,
        description: meta.description ?? "",
        date_created: meta.date_created,
        center: meta.center ?? "",
        keywords: meta.keywords,
        thumbnail,
        largeUrl,
      };
    }
  );

  const hasNext = collection.links?.some(
    (l: { rel: string }) => l.rel === "next"
  );

  return { items, totalHits, nextPage: hasNext ? page + 1 : undefined };
}
