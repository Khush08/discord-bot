require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { monitorBSEAnnouncements } = require('./bse.js');
const { upsertCache } = require('./cache.js');

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
                const { link, company, cacheKey, intentType, time } = news[item];

                if (upsertCache(cacheKey, true)) {
                    console.log(`Already sent: ${cacheKey}`);
                    continue;
                }

                const embed = new EmbedBuilder()
                    .setColor(0x0099ff) // Hex color code
                    .setTitle(company) // Title
                    .setURL(link)
                    .setFooter({
                        text: `${intentType} - ${time}`,
                    }); // Embedded link

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
