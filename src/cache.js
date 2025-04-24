import fs from "fs/promises";
import { logger } from "./utils/logger.js";

const TRAITS_FILE = "traits_cache.json";
export const userTraitsCache = new Map();

export async function loadTraitsCache() {
  try {
    await fs.access(TRAITS_FILE); // Check if the file exists
    const raw = await fs.readFile(TRAITS_FILE, "utf-8");
    const data = JSON.parse(raw);
    for (const [id, traits] of Object.entries(data)) {
      userTraitsCache.set(id, traits);
    }
    logger.ok("Traits cache loaded from disk");
  } catch (err) {
    if (err.code !== "ENOENT") {
      logger.err("Failed to load traits cache:", err.message);
    } else {
      logger.sys("No cache file found - starting fresh");
    }
  }
}

export async function saveTraitsCache() {
  const obj = Object.fromEntries(userTraitsCache);
  await fs.writeFile(TRAITS_FILE, JSON.stringify(obj, null, 2));
  logger.ok("Traits cache synced to disk");
}
