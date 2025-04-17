# Discord Bot for Stock Market Sentiment Analysis

This Discord bot gets order and result data from BSE


## Prerequisites

- Node.js
- npm
- A Discord bot token and you channel ID

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

1. Start the bot:
    ```sh
    node index
    ```

2. The bot will log in to Discord and will send order and result data from BSE
