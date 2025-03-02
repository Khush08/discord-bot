# Discord Bot for Stock Market Sentiment Analysis

This Discord bot analyzes the sentiment of news articles related to the Indian stock market using OpenAI's ChatGPT and posts the results in a specified Discord channel.

## Features

- Fetches recent news articles about companies.
- Analyzes the sentiment of the news articles considering the current market trend (Bullish, Bearish, or Neutral).
- Posts the sentiment analysis results in a Discord channel.

## Prerequisites

- Node.js
- npm
- A Discord bot token
- OpenAI API key
- Stock API key

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/discord-bot.git
    cd discord-bot
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory and add the following environment variables:
    ```env
    BOT_TOKEN=your-discord-bot-token
    OPENAI_TOKEN=your-openai-api-key
    STOCK_API_KEY=your-stock-api-key
    CHANNEL_ID=your-discord-channel-id
    ```

## Usage

1. Start the bot:
    ```sh
    node index.js
    ```

2. The bot will log in to Discord and start monitoring the API for news articles. It will analyze the sentiment of the news articles and post the results in the specified Discord channel.

## License

This project is licensed under the MIT License.