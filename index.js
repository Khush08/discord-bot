require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { OpenAI } = require('openai');
const axios = require('axios').default;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Bot token and other config
const BOT_TOKEN = process.env.BOT_TOKEN;
const OPENAI_TOKEN = process.env.OPENAI_TOKEN;

const openai = new OpenAI({
    apiKey: OPENAI_TOKEN,
});

// Function to analyze sentiment using OpenAI's ChatGPT
async function analyzeSentiment(news, trend) {
    if (!news) return 'No Impact';

    const prompt = `You are a seasoned stock market expert and an investment banker at JP Morgan 
        with years of research on how news impacts stock prices in the Indian stock markets, 
        factoring in prevailing market trend.


        I will provide you with two inputs:
            1. A set of recent news about a company.
            2. The current overall market trend as Bullish, Bearish or Neutral.

        Your task is to:
        - Analyze how the provided news might affect the company's stock price, taking into account the market trend.
        - Categorize the impact using one of these labels: "Very Positive", "Positive", "No Impact", "Negative", or "Very Negative".

        Please provide only the sentiment label as the final output.

        News:
        ${news}

        Market trend:
        ${trend}`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4-turbo',
            messages: [{ role: 'user', content: prompt }],
        });
        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error analyzing sentiment:', error);
        return 'Neutral';
    }
}

async function getMarketTrend() {
    const url = 'https://query1.finance.yahoo.com/v8/finance/chart/^NSEI'; // NIFTY 50 Index
    try {
        const response = await axios.get(url);
        const data = response.data.chart.result[0].meta;
        const currentPrice = data.regularMarketPrice;
        const prevClose = data.previousClose;

        if (currentPrice > prevClose * 1.2) return 'Bullish';
        if (currentPrice < prevClose * 0.99) return 'Bearish';
        return 'Neutral';
    } catch (error) {
        console.error('Error fetching market trend:', error);
        return 'Neutral';
    }
}

async function getNews() {
    try {
        const response = await axios.get('https://stock.indianapi.in/news', {
            headers: { 'X-Api-Key': process.env.STOCK_API_KEY },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching API data:', error);
        return [];
    }
}

// Monitor API and check for changes
async function checkAPI() {
    try {
        // Send message to a specific channel
        const channel = client.channels.cache.get(process.env.CHANNEL_ID); // Replace with your channel ID
        if (channel) {
            const news = await getNews();
            const marketTrend = await getMarketTrend();

            await channel.send(`Market Trend: ${marketTrend}`);

            for (let item in news) {
                const sentiment = await analyzeSentiment(news[item].summary, marketTrend);

                if (!sentiment.includes('No Impact')) {
                    const embed = new EmbedBuilder()
                        .setColor(0x0099ff) // Hex color code
                        .setTitle(news[item].title)
                        .setURL(news[item].url) // Embedded link
                        .setDescription(
                            `${news[item].summary}\n\nTopics: ${news[item].topics}\n\nSentiment: ${sentiment}`,
                        );

                    await channel.send({ embeds: [embed] });
                }
            }
        }
    } catch (error) {
        console.error('Error fetching API data:', error);
    } finally {
        client.destroy();
    }
}

// Bot ready event
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    checkAPI();
});

// Log in to Discord
client.login(BOT_TOKEN);
