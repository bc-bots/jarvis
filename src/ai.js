import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function generateTraitsPrompt(userName, traitSummary, messages) {
  const prompt = process.env.TRAITS_PROMPT.replace("{userName}", userName)
    .replace("{traitSummary}", traitSummary)
    .replace("{messages}", messages.join("\n"));
  return await model.generateContent(prompt);
}

export async function generateChatReply(
  chatHistory,
  traitSummary,
  message,
  author
) {
  const prompt = process.env.CHAT_REPLY_PROMPT.replace(
    "{chatHistory}",
    chatHistory
  )
    .replace("{traitSummary}", traitSummary)
    .replace("{message}", message)
    .replace("{authorUsername}", author.username);
  return await model.generateContent(prompt);
}
