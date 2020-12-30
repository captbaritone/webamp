import fetch from "node-fetch";
import { CLOUDFLARE_PURGE_AUTH_KEY } from "./config";

const cdnZone = "b2c0ca43723f95f9d317710ff2ce86a3";

export async function purgeFiles(files: string[]): Promise<void> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${cdnZone}/purge_cache`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_PURGE_AUTH_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ files }),
    }
  );

  const body = await response.json();
  if (!response.ok) {
    console.error(body);
    throw new Error(`Got error response: ${response.status}`);
  }
  if (!body.success) {
    throw new Error(`Could not purge URLs: '${JSON.stringify(body)}'`);
  }
}
