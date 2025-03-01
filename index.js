require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { OpenAI } = require("openai");
const axios = require('axios').default;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Bot token and other config
const BOT_TOKEN = process.env.BOT_TOKEN;
const OPENAI_TOKEN = process.env.OPENAI_TOKEN;

const openai = new OpenAI({
    apiKey: OPENAI_TOKEN
});

// Function to analyze sentiment using OpenAI's ChatGPT
async function analyzeSentiment(news) {
    if (!news) return "Neutral";

    const prompt = `You are a stock market expert and an investment banker at JP Morgan.
    You have done extensive research for many years about how news affect stock prices in Indian stock markets.
    Analyze the sentiment of the following news about a company. 
    Assign one of the following labels: 'Very Positive', 'Positive', 'No Impact', 'Negative', 'Very Negative'.
    
    News:
    ${news}
    
    Return only the sentiment label.`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [{ role: "user", content: prompt }]
        });
        return response.choices[0].message.content.trim()
    } catch (error) {
        console.error("Error analyzing sentiment:", error);
        return "Neutral";
    }
}

// Monitor API and check for changes
async function checkAPI() {
    try {
        const response = await axios.get('https://stock.indianapi.in/news', {
            headers: {'X-Api-Key': process.env.STOCK_API_KEY}
          });
        const newData = response.data;
        

        // Send message to a specific channel
        const channel = client.channels.cache.get(process.env.CHANNEL_ID); // Replace with your channel ID
        if (channel) {
            for(let item in newData){
                const sentiment = await analyzeSentiment(newData[item].summary);

                if(!sentiment.includes("No Impact")) {
                    const embed = new EmbedBuilder()
                        .setColor(0x0099ff) // Hex color code
                        .setTitle(newData[item].title)
                        .setURL(newData[item].url) // Embedded link
                        .setDescription(`${newData[item].summary}\n\nSentiment: ${sentiment}`)
                        
                    await channel.send({ embeds: [embed] });
                };
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
