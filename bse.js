const puppeteer = require('puppeteer');

// Configuration
const config = {
    url: 'https://www.bseindia.com/corporates/ann.html',
    maxRetries: 3,
    retryDelaySeconds: 10,
    browser: {
        headless: 'new', // Use 'new' headless mode for better performance
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
};

// Main function to monitor BSE announcements
const monitorBSEAnnouncements = async () => {
    let browser;
    let page;

    browser = await puppeteer.launch(config.browser);

    if (!page || page.isClosed()) {
        page = await browser.newPage();
        // Set viewport to ensure all elements are visible
        await page.setViewport({ width: 1366, height: 768 });
    }

    try {
        console.log(`refetching announcements...`);

        // Navigate to the BSE announcements page
        for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
            try {
                await page.goto(config.url, { waitUntil: 'networkidle2', timeout: 60000 });
                break;
            } catch (error) {
                if (attempt === config.maxRetries) throw error;
                await new Promise((r) => setTimeout(r, config.retryDelaySeconds * 1000));
            }
        }
        // Check if there are any results
        const noRecordsText = await page.evaluate(() => {
            return document.body.innerText.includes('No Records Found');
        });

        if (noRecordsText) {
            return [];
        }

        // Extract announcements data
        const newAnnouncements = await page.evaluate(() => {
            const exchangeReceivedInfoToTime = (str) => {
                // Extract date and time
                const dateTimeRegex = /(\d{2}-\d{2}-\d{4})\s+(\d{2}:\d{2}:\d{2})/;
                const match = str.match(dateTimeRegex);
                if (!match) {
                    return '';
                }
                const dateStr = match[1]; // DD-MM-YYYY format
                const timeStr = match[2]; // HH:mm:SS format

                return `${dateStr} ${timeStr}`;
            };

            const getIntentType = (str) => {
                if (str.includes('Bonus')) {
                    return 'Bonus';
                } else if (str.includes('Split')) {
                    return 'Split';
                } else if (str.includes('Award_of_Order_Receipt_of_Order')) {
                    return 'Orders';
                } else if (str.includes('Result') || str.includes('Financial')) {
                    return 'Results';
                } else {
                    return 'Unknown';
                }
            };

            const tables = document.querySelectorAll('table table tbody tr table.ng-scope');
            const results = Array.from(tables)
                .filter(
                    (row) =>
                        !row.classList.contains('ng-scope') ||
                        !row.classList.contains('__web-inspector-hide-shortcut__'),
                )
                .filter((table) => {
                    const mainRow = table.getElementsByTagName('tr')[0];
                    const headline = mainRow.getElementsByTagName('td')[0].innerText;
                    const type = mainRow.getElementsByTagName('td')[1].innerText;

                    if (type === 'Corp. Action') {
                        return headline.includes('Bonus') || headline.includes('Split');
                    }

                    if (type === 'Company Update') {
                        return headline.includes('Award_of_Order_Receipt_of_Order');
                    }

                    if (type === 'Integrated Filing') {
                        return headline.includes('Financial');
                    }

                    return type === 'Result' || type === 'Results';
                })
                .map((t) => {
                    const timeRow = t.getElementsByTagName('tr')[2];
                    const exchangeReceivedInfo = timeRow.getElementsByTagName('td')[0].innerText;
                    const resultRow = t.getElementsByTagName('tr')[0];
                    const headline = resultRow.getElementsByTagName('td')[0].innerText.trim();
                    const link = resultRow.getElementsByTagName('a')[0].getAttribute('href');

                    const parts = headline.trim().split(' - ');
                    const company = parts[0].trim();
                    const intentType = getIntentType(parts[2]);
                    const timeStr = exchangeReceivedInfoToTime(exchangeReceivedInfo);

                    return {
                        company,
                        intentType: getIntentType(parts[2]),
                        link: `https://www.bseindia.com${link}`,
                        time: timeStr,
                        messageKey: `${company} - ${intentType} - ${timeStr}`,
                    };
                });

            return results;
        });

        if (page && !page.isClosed()) {
            await page.close().catch((e) => console.log(`Error closing page: ${e.message}`));
        }

        if (browser) {
            await browser.close().catch((e) => console.log(`Error closing browser: ${e.message}`));
        }

        return newAnnouncements;
    } catch (error) {
        // If page crashed, create a new one
        if (error.message.includes('Target closed') || error.message.includes('Protocol error')) {
            if (page && !page.isClosed()) {
                await page.close().catch((e) => console.log(`Error closing page: ${e.message}`));
            }

            if (browser) {
                await browser
                    .close()
                    .catch((e) => console.log(`Error closing browser: ${e.message}`));
            }

            page = null;
        }

        return [];
    }
};

module.exports = {
    monitorBSEAnnouncements,
};
