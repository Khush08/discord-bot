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
    timeLimit: 30 * 60 * 1000,
};

// Setup logging
const log = (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${message}`;
    console.log(logMessage);
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
        log('Starting BSE announcements monitoring');

        // Navigate to the BSE announcements page
        for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
            try {
                await page.goto(config.url, { waitUntil: 'networkidle2', timeout: 60000 });
                break;
            } catch (error) {
                log(`Navigation error (attempt ${attempt}/${config.maxRetries}): ${error.message}`);
                if (attempt === config.maxRetries) throw error;
                await new Promise((r) => setTimeout(r, config.retryDelaySeconds * 1000));
            }
        }

        log('Successfully loaded BSE announcements page');
        // Check if there are any results
        const noRecordsText = await page.evaluate(() => {
            return document.body.innerText.includes('No Records Found');
        });

        if (noRecordsText) {
            log('No new records found in this check');
            return [];
        }

        // Extract announcements data
        const newAnnouncements = await page.evaluate(() => {
            const tables = document.querySelectorAll('table table tbody tr table.ng-scope');
            const filteredRows = Array.from(tables)
                .filter(
                    (row) =>
                        !row.classList.contains('ng-scope') ||
                        !row.classList.contains('__web-inspector-hide-shortcut__'),
                )
                .filter((table) => {
                    const mainRow = table.getElementsByTagName('tr')[0];
                    const headline = mainRow.getElementsByTagName('td')[0].innerText;
                    const type = mainRow.getElementsByTagName('td')[1].innerText;

                    if (type === 'Company Update') {
                        return headline.includes('Award_of_Order_Receipt_of_Order');
                    }

                    if (type === 'Result') {
                        return headline.includes('Results');
                    }

                    return false;
                })
                .map((t) => t.getElementsByTagName('tr')[0]);

            const results = filteredRows.map((row) => {
                const headline = row.getElementsByTagName('td')[0].innerText.trim();
                const link = row.getElementsByTagName('a')[0].getAttribute('href');

                const parts = headline.trim().split(' - ');

                return {
                    company: parts[0].trim(),
                    intentType: parts[2].trim().includes('Award_of_Order_Receipt_of_Order')
                        ? 'Orders'
                        : 'Results',
                    link: `https://www.bseindia.com${link}`,
                };
            });

            return results;
        });

        // Setup graceful shutdown
        const shutdown = async () => {
            log('Shutting down...');

            if (page && !page.isClosed()) {
                await page.close().catch((e) => log(`Error closing page: ${e.message}`));
            }

            if (browser) {
                await browser.close().catch((e) => log(`Error closing browser: ${e.message}`));
            }

            log('Successfully shut down');
        };

        shutdown();

        return newAnnouncements;
    } catch (error) {
        log(`Error during check: ${error.message}`);

        // If page crashed, create a new one
        if (error.message.includes('Target closed') || error.message.includes('Protocol error')) {
            log('Browser target closed unexpectedly, will create new page on next check');
            if (page && !page.isClosed()) {
                await page.close().catch((e) => log(`Error closing page: ${e.message}`));
            }

            if (browser) {
                await browser.close().catch((e) => log(`Error closing browser: ${e.message}`));
            }

            page = null;
        }

        return [];
    }
};

module.exports = {
    monitorBSEAnnouncements,
};
