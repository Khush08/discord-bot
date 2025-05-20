require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, Events } = require('discord.js');
const { monitorBSEAnnouncements } = require('./bse.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Bot token and other config
const BOT_TOKEN = process.env.BOT_TOKEN;

// Monitor API and check for changes
async function checkAPI(channel) {
    try {
        // Send message to a specific channel
        if (channel) {
            const messages = await channel.messages.fetch({ limit: 10 });
            const messageKeys = messages
                .map((message) => message.embeds[0])
                .map((embed) => {
                    const {
                        title,
                        footer: { text },
                    } = embed.data;

                    return `${title} - ${text}`;
                });

            const news = await monitorBSEAnnouncements();

            if (!news || news.length === 0) {
                console.log('No new announcements found.');
            }

            for (let item in news) {
                const { link, company, intentType, time, messageKey } = news[item];

                if (messageKeys.includes(messageKey)) {
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
        await client.send(`Error fetching API data ${error.message}`);
    } finally {
        setTimeout(() => {
            checkAPI(channel);
        }, 1000 * 60); // Check every 1 minute
    }
}

// Bot ready event
client.once(Events.ClientReady, () => {
    const channel = client.channels.cache.get(process.env.CHANNEL_ID);
    checkAPI(channel);
});

// Log in to Discord
client.login(BOT_TOKEN);
