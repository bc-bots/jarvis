import { Client, GatewayIntentBits, REST, Routes } from "discord.js";
import dotenv from "dotenv";
import { handleMessage, handleInteraction, commands } from "./commands.js";
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

// Register slash commands
client.once("ready", async () => {
  logger.discord(`Discord client initialized as ${client.user.tag}`);
  logger.ok(
    `Bot instance ready with ${
      Object.keys(client.guilds.cache).length
    } guilds loaded`
  );

  const rest = new REST({ version: "10" }).setToken(process.env.JARVIS_KEY);

  try {
    logger.ok("Registering slash commands...");
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    });
    logger.ok("Slash commands registered successfully!");
  } catch (error) {
    logger.err("Failed to register slash commands:", error.message);
  }
});

client.on("messageCreate", handleMessage);
client.on("interactionCreate", handleInteraction);

client
  .login(process.env.JARVIS_KEY)
  .then(() => logger.ok("Authentication successful"))
  .catch((err) => logger.err("Failed to authenticate -", err.message));
