import fs from "fs/promises";

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
    console.log("Traits cache loaded.");
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.error("Error loading trait cache:", err);
    } else {
      console.log("Traits cache file does not exist. Starting fresh.");
    }
  }
}

export async function saveTraitsCache() {
  const obj = Object.fromEntries(userTraitsCache);
  await fs.writeFile(TRAITS_FILE, JSON.stringify(obj, null, 2));
  console.log("Traits cache saved.");
}
