import type { Metadata } from "next";
import { museumMetadata } from "../museumMetadata";

export const dynamic = "force-dynamic"; // Force this page to always be server-rendered

export async function generateMetadata({ searchParams }): Promise<Metadata> {
  const { query } = await searchParams;
  return museumMetadata(query);
}

// The classic museum's home page. The (legacy) layout renders the app.
export default function Page() {
  return null;
}
