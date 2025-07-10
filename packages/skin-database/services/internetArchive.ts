import fetch from "node-fetch";
import { execFile } from "../utils";
import path from "path";

// Path to the ia command in the virtual environment
const IA_COMMAND = path.join(__dirname, "../.venv/bin/ia");

// Environment variables for the virtual environment
const getVenvEnv = () => ({
  ...process.env,
  PATH: `${path.join(__dirname, "../.venv/bin")}:${process.env.PATH}`,
  VIRTUAL_ENV: path.join(__dirname, "../.venv"),
});

export async function fetchMetadata(identifier: string): Promise<any> {
  const r = await fetch(`https://archive.org/metadata/${identifier}`);
  if (!r.ok) {
    console.error(await r.json());
    throw new Error(`Could not fetch metadata for ${identifier}`);
  }
  return r.json();
}

export async function fetchTasks(identifier: string): Promise<any> {
  const result = await execFile(IA_COMMAND, ['tasks', identifier], {
    env: getVenvEnv(),
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
  await execFile(IA_COMMAND, ['upload', identifier, filepath], {
    env: getVenvEnv(),
  });
}

export async function uploadFiles(
  identifier: string,
  filepaths: string[],
  metadata?: { [key: string]: string }
): Promise<any> {
  const args = ['upload', identifier, ...filepaths];
  
  if (metadata) {
    Object.entries(metadata).forEach(([key, value]) => {
      args.push(`--metadata=${key}:${value}`);
    });
  }
  
  await execFile(IA_COMMAND, args, { env: getVenvEnv() });
}

export async function uploadFiles(
  identifier: string,
  filepaths: string[],
  metadata?: { [key: string]: string }
): Promise<any> {
  const args = ['upload', identifier, ...filepaths];
  
  if (metadata) {
    Object.entries(metadata).forEach(([key, value]) => {
      args.push(`--metadata=${key}:${value}`);
    });
  }
  
  await execFile(IA_COMMAND, args, { env: getVenvEnv() });
}

export async function identifierExists(identifier: string): Promise<boolean> {
  const result = await execFile(IA_COMMAND, ['metadata', identifier], {
    env: getVenvEnv(),
  });
  const data = JSON.parse(result.stdout);
  return Object.keys(data).length > 0;
}

export async function setMetadata(
  identifier: string,
  data: { [key: string]: string }
) {
  const pairs = Object.entries(data).map(([key, value]) => `${key}:${value}`);
  const args = ['metadata', identifier, ...pairs.map((pair) => `--modify=${pair}`)];
  await execFile(IA_COMMAND, args, { env: getVenvEnv() });
}
