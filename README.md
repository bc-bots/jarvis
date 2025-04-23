# Jarvis - A Discord Bot with Personality

Jarvis is a Discord bot designed to interact with users in a sarcastic, darkly humorous, and engaging manner. It uses AI to analyze user messages and generate personality traits, which it incorporates into its responses. Jarvis also provides helpful replies when users ask for assistance.

## Features

- **AI-Powered Personality Analysis**: Tracks user messages and generates personality traits.
- **Dynamic Responses**: Generates witty, sarcastic, and context-aware replies.
- **Trait Profile**: Allows users to view their personality traits through a `/traits` command.
- **Customizable Cooldowns**: Prevents spam by limiting bot responses per channel.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB instance
- Discord bot token
- Google Generative AI API key

## Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd jarvis
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root and add the following:

   ```
   JARVIS_KEY=<your-discord-bot-token>
   MONGO_URI=<your-mongodb-connection-string>
   GOOGLE_API_KEY=<your-google-generative-ai-api-key>
   ```

4. Start the bot:
   ```bash
   node start
   ```

## Usage

- **Chat Interaction**: Jarvis will automatically respond to messages in channels it has access to.
- **Commands**:
  - `/hello`: Jarvis will greet you.
  - `/traits`: View your personality traits as analyzed by Jarvis.

## File Structure

- `jarvis.js`: Main bot logic.
- `traits_cache.json`: Cached user traits for faster access.
- `.env`: Environment variables (not included in the repository).

## Contributing

Feel free to fork the repository and submit pull requests. Contributions are welcome!

## License

This project is licensed under the MIT License.
