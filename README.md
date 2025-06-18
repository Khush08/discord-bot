# Discord Bot for Stock Market Sentiment Analysis

This Discord bot scrapes Order, Board Meeting, AGM, EGM, and Results data from the Bombay Stock Exchange (BSE) website, performs AI analysis using Ollama and sends the analysis to a specified Discord channel.

- Please note that this bot is for educational purposes only and should not be used for actual trading decisions.
- The snapshot of data is created using AI which can be wrong (The figures in tables are often wrong), so please double check the data. (This bot also attaches the pdf link of the data in the message).
- This project is not for production usage.

## Prerequisites

- npm
- Ollama
- A Discord bot token and your channel ID

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
    CHANNEL_ID=your-discord-channel-id
    ```

## Usage

1. Ensure that Ollama is installed and running on your machine. You can download it from [Ollama's official website](https://ollama.com/).

2. Make sure you have the gemma3:4b models downloaded in Ollama. You can do this by running:

    ```sh
    ollama pull gemma3:4b
    ```

3. Start the bot:
    ```sh
    node index
    ```

## Author

- [Khush Dassani](https://github.com/Khush08)
