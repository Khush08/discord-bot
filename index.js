require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios').default;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Bot token and other config
const BOT_TOKEN = process.env.BOT_TOKEN; 

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
                const message = `**${newData[item].title}**\n${newData[item].summary}\n${newData[item].url}`;
                console.log(message);
                channel.send(message);
            }
        }

    } catch (error) {
        console.error('Error fetching API data:', error);
    }
}

// Bot ready event
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    checkAPI();
});

// Log in to Discord
client.login(BOT_TOKEN);
