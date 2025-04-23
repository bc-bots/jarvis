import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  Collection,
} from "discord.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";

dotenv.config();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI).catch((err) => {
  console.error("Error connecting to MongoDB:", err);
  process.exit(1); // Exit the process if the database connection fails
});

const traitSchema = new mongoose.Schema({
  _id: String, // userId
  name: String,
  trait_summary: String,
});

const Trait = mongoose.model("Trait", traitSchema);

// Google GenAI setup
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Bot setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const userMessages = new Map();
const userMessageCount = new Map();
const userTraitsCache = new Map();
const cooldowns = new Map(); // Map to store cooldowns per channel
const COOLDOWN_SECONDS = 5;
const TRAITS_FILE = "traits_cache.json";

// Load cached traits from file
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

// Save cache periodically
async function saveTraitsCache() {
  const obj = Object.fromEntries(userTraitsCache);
  await fs.writeFile(TRAITS_FILE, JSON.stringify(obj, null, 2));
  console.log("Traits cache saved.");
}

setInterval(saveTraitsCache, 60 * 1000); // every 1 min

client.once("ready", () => {
  console.log(`Bot ${client.user.tag} is now online.`);
});

client.on("messageCreate", async (message) => {
  if (!message.guild) return;
  if (message.author.bot) return;

  const now = Date.now();
  for (const [key, expiration] of cooldowns.entries()) {
    if (now > expiration) cooldowns.delete(key);
  }

  const userId = message.author.id;
  const userName = message.author.username;
  const channelKey = `${message.guild.id}-${message.channel.id}`;

  // Rate limiting
  const expiration = cooldowns.get(channelKey) || 0;
  if (now < expiration) return;
  cooldowns.set(channelKey, now + COOLDOWN_SECONDS * 1000);

  let traitDoc = userTraitsCache.get(userId);
  if (!userTraitsCache.has(userId)) {
    const dbDoc = await Trait.findById(userId).lean();
    userTraitsCache.set(userId, dbDoc || { trait_summary: "None yet." });
  }

  if (!traitDoc) {
    await Trait.create({
      _id: userId,
      name: userName,
      trait_summary: "None yet.",
    });
    traitDoc = { trait_summary: "None yet." };
    userTraitsCache.set(userId, traitDoc);
  }

  if (!userMessages.has(userId)) userMessages.set(userId, []);
  const messages = userMessages.get(userId);
  messages.push(message.content);
  if (messages.length > 50) messages.shift();

  const count = (userMessageCount.get(userId) || 0) + 1;
  userMessageCount.set(userId, count);

  if (count % 10 === 0) {
    const traitPrompt = `
Below are recent messages from a user named ${userName}:
Current trait summary: ${traitDoc.trait_summary}

${messages.join("\n")}

Generate exactly 10 short, quirky, distinct phrases describing their personality or communication style.
Format:
Here is what I know about ${userName}:
- <trait>`;

    try {
      await message.channel.sendTyping();
      const result = await model.generateContent(traitPrompt);
      const newSummary = result?.response?.text?.trim();
      if (!newSummary) throw new Error("Empty response from AI model.");
      traitDoc.trait_summary = newSummary;
      userTraitsCache.set(userId, traitDoc);
      await Trait.findByIdAndUpdate(userId, { trait_summary: newSummary });
    } catch (err) {
      console.error("Trait generation error:", err);
    }
  }

  let chatHistory = ""; // Define a fallback value for chatHistory

  try {
    const history = await message.channel.messages.fetch({ limit: 13 });
    const recent = [...history.values()].reverse();
    chatHistory = recent
      .map((m) => `${m.author.username}: ${m.content}`)
      .join("\n");
  } catch (err) {
    console.error("Error fetching message history:", err);
    chatHistory = "No recent chat history available."; // Fallback value
  }

  const prompt = `
Recent chat history:
${chatHistory}
User traits:
${traitDoc.trait_summary}

Your name is Jarvis, a discord bot.
Generate a single short, sarcastic, and darkly humorous reply to this message: '${message.content}' by ${message.author.username}.
The reply can be rude but funny, and no longer than one sentence.
Don't use quotes in the response.
Keep the conversation flowing based on the chat history context.
But in any case if the user is asking for help, be helpful.`;

  // console.log("Prompt:", prompt);
  await message.channel.sendTyping();
  const replyResult = await model.generateContent(prompt);
  await message.channel.send(replyResult.response.text());
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "hello") {
    await interaction.reply("Greetings, mortal.");
  }

  if (interaction.commandName === "traits") {
    const userId = interaction.user.id;
    let traitDoc = userTraitsCache.get(userId);
    if (!traitDoc) {
      traitDoc = await Trait.findById(userId);
      if (traitDoc) userTraitsCache.set(userId, traitDoc);
    }

    if (
      !traitDoc ||
      !traitDoc.trait_summary ||
      traitDoc.trait_summary === "None yet."
    ) {
      await interaction.reply(
        "I haven't figured you out yet... Send more messages and give me time."
      );
    } else {
      const embed = new EmbedBuilder()
        .setTitle(`${interaction.user.username}'s Trait Profile`)
        .setDescription(traitDoc.trait_summary)
        .setColor("Purple")
        .setFooter({ text: "Generated by your lovely local AI stalker 🤖" });
      await interaction.reply({ embeds: [embed] });
    }
  }
});

client.login(process.env.JARVIS_KEY);
