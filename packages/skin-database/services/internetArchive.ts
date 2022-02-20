import fetch from "node-fetch";
import { exec } from "../utils";

export async function fetchMetadata(identifier: string): Promise<any> {
  const r = await fetch(`https://archive.org/metadata/${identifier}`);
  if (!r.ok) {
    console.error(await r.json());
    throw new Error(`Could not fetch metadata for ${identifier}`);
  }
  return r.json();
}

export async function fetchTasks(identifier: string): Promise<any> {
  const command = `ia tasks ${identifier}`;
  const result = await exec(command, {
    encoding: "utf8",
  });
  return result.stdout
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
}

export async function uploadFile(
  identifier: string,
  filepath: string
): Promise<any> {
  const command = `ia upload ${identifier} "${filepath}"`;
  await exec(command, { encoding: "utf8" });
}

export async function identifierExists(identifier: string): Promise<boolean> {
  const result = await exec(`ia metadata ${identifier}`);
  const data = JSON.parse(result.stdout);
  return Object.keys(data).length > 0;
}

export async function setMetadata(
  identifier: string,
  data: { [key: string]: string }
) {
  const pairs = Object.entries(data).map(([key, value]) => `${key}:${value}`);
  const args = pairs.map((pair) => `--modify="${pair}"`);
  const command = `ia metadata ${identifier} ${args.join(" ")}`;
  await exec(command);
}
