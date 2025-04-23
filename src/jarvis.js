import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { handleMessage, handleInteraction } from "./commands.js";
import { connectToDatabase } from "./db.js";
import { loadTraitsCache, saveTraitsCache } from "./cache.js";

dotenv.config();

// Connect to MongoDB
connectToDatabase();

// Load cached traits
await loadTraitsCache();
setInterval(saveTraitsCache, 60 * 1000); // Save cache every 1 minute

// Bot setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`Bot ${client.user.tag} is now online.`);
});

client.on("messageCreate", handleMessage);
client.on("interactionCreate", handleInteraction);

client.login(process.env.JARVIS_KEY);
