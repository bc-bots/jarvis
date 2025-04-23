import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function generateTraitsPrompt(userName, traitSummary, messages) {
  const prompt = `
Below are recent messages from a user named ${userName}:
Current trait summary: ${traitSummary}

${messages.join("\n")}

Generate exactly 10 short, quirky, distinct phrases describing their personality or communication style.
Format:
Here is what I know about ${userName}:
- <trait>`;
  return await model.generateContent(prompt);
}

export async function generateChatReply(chatHistory, traitSummary, message) {
  const prompt = `
Recent chat history:
${chatHistory}
User traits:
${traitSummary}

Your name is Jarvis, a discord bot.
Generate a single short, sarcastic, and darkly humorous reply to this message: '${message}'.
The reply can be rude but funny, and no longer than one sentence.
Don't use quotes in the response.
Keep the conversation flowing based on the chat history context.
But in any case if the user is asking for help, be helpful.`;
  return await model.generateContent(prompt);
}
