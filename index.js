require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { monitorBSEAnnouncements } = require('./bse.js'); // Assuming bse.js is in the same directory

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Bot token and other config
const BOT_TOKEN = process.env.BOT_TOKEN;

// Monitor API and check for changes
async function checkAPI() {
    try {
        // Send message to a specific channel
        const channel = client.channels.cache.get(process.env.CHANNEL_ID); // Replace with your channel ID
        if (channel) {
            const news = await monitorBSEAnnouncements();

            if (!news || news.length === 0) {
                console.log('No new announcements found.');
            }

            for (let item in news) {
                const embed = new EmbedBuilder()
                    .setColor(0x0099ff) // Hex color code
                    .setTitle(news[item].company) // Title
                    .setURL(news[item].link)
                    .setDescription(`${news[item].intentType} for ${news[item].company}`); // Embedded link

                await channel.send({ embeds: [embed] });
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
