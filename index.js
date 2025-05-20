require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, Events } = require('discord.js');
const { monitorBSEAnnouncements } = require('./bse.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Bot token and other config
const BOT_TOKEN = process.env.BOT_TOKEN;

// Monitor API and check for changes
async function checkAPI() {
    try {
        // Send message to a specific channel
        const channel = client.channels.cache.get(process.env.CHANNEL_ID); // Replace with your channel ID
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
                    console.log(`Already sent message for ${messageKey}`);
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
client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}!`);
    checkAPI();
});

// Log in to Discord
client.login(BOT_TOKEN);
