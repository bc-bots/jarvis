import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { handleMessage, handleInteraction } from "./commands.js";
import { connectToDatabase } from "./db.js";
import { loadTraitsCache, saveTraitsCache } from "./cache.js";
import { logger } from "./utils/logger.js";

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
  logger.discord(`Discord client initialized as ${client.user.tag}`);
  logger.ok(
    `Bot instance ready with ${
      Object.keys(client.guilds.cache).length
    } guilds loaded`
  );
});

client.on("messageCreate", handleMessage);
client.on("interactionCreate", handleInteraction);

client
  .login(process.env.JARVIS_KEY)
  .then(() => logger.ok("Authentication successful"))
  .catch((err) => logger.err("Failed to authenticate -", err.message));
