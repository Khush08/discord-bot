require('dotenv').config();
const fs = require('fs');
const { Client, GatewayIntentBits, EmbedBuilder, Events } = require('discord.js');
const { getStockMarketInfo } = require('./getStockMarketInfo.js');
const { ollamaMeetingAnalysis } = require('./ollamaMeetingAnalysis.js');
const { ollamaOrderAnalysis } = require('./ollamaOrdersAnalysis.js');
const { ollamaResultAnalysis } = require('./ollamaResultAnalysis.js');
const { parsePDFText } = require('./parsePDFText.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Bot token and other config
const BOT_TOKEN = process.env.BOT_TOKEN;

const cache = [];

const getEmbed = (company, link, intentType, time, analysis) => {
    return new EmbedBuilder()
        .setColor(0x0099ff) // Hex color code
        .setTitle(company) // Title
        .setURL(link)
        .setDescription(analysis) // Analysis text
        .setFooter({
            text: `${intentType} - ${time}`,
        }); // Embedded link
};

const getAnalysis = async (intentType, data) => {
    if (intentType === 'Meetings' || intentType === 'AGM' || intentType === 'EGM') {
        return await ollamaMeetingAnalysis(data);
    } else if (intentType === 'Orders') {
        return await ollamaOrderAnalysis(data);
    } else if (intentType === 'Results') {
        return await ollamaResultAnalysis(data);
    } else {
        return 'No analysis available for this intent type.';
    }
};

const getData = async ({ link, company, intentType, time, messageKey }) => {
    const pdfData = await parsePDFText(link);
    const analysis = await getAnalysis(intentType, pdfData);

    cache.push(messageKey);

    return getEmbed(company, link, intentType, time, analysis);
};

// Monitor API and check for changes
async function checkAPI() {
    try {
        console.log(`Checking for new announcements...`);
        // Send message to a specific channel
        const channel = client.channels.cache.get(process.env.CHANNEL_ID); // Replace with your channel ID
        if (channel) {
            const newsItems = await getStockMarketInfo();

            const latestNews = newsItems.filter((item) => !cache.includes(item.messageKey));

            for (let news of latestNews) {
                const { link, company, intentType, time, messageKey } = news;
                const pdfData = await parsePDFText(link);
                const analysis = await getAnalysis(intentType, pdfData);
                const embed = getEmbed(company, link, intentType, time, analysis);

                await channel.send({ embeds: [embed] });

                console.log(`New announcement sent: ${messageKey}`);
                cache.push(messageKey);
            }
        }
    } catch (error) {
        console.error('Error fetching API data:', error);
    } finally {
        setTimeout(checkAPI, 60000); // Check every minute
    }
}

// Bot ready event
client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}!`);
    if (fs.existsSync('cache.json')) {
        const cachedData = JSON.parse(fs.readFileSync('cache.json', 'utf8'));
        cache.push(...cachedData.items);
    }
    checkAPI();
});

process.on('exit', () => {
    // Save cache to file on exit
    fs.writeFileSync('cache.json', JSON.stringify({ items: cache }), 'utf8');
});

// Log in to Discord
client.login(BOT_TOKEN);
