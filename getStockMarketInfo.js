import puppeteer from 'puppeteer';
// Configuration
const config = {
    url: 'https://www.bseindia.com/corporates/ann.html',
    maxRetries: 3,
    retryDelaySeconds: 10,
    browser: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
};
export const getStockMarketInfo = async () => {
    const browser = await puppeteer.launch(config.browser);
    const page = await browser.newPage();

    // Set viewport to ensure all elements are visible
    await page.setViewport({ width: 1920, height: 1064 });

    // Navigate to the BSE announcements page
    await page.goto(config.url, { waitUntil: 'networkidle2', timeout: 60000 });

    const results = await page.evaluate(async () => {
        const bulkResults = [];
        const gotoDocumentState = async (document, categoryValue, subCategoryValue) => {
            const categoryElement = document.getElementById('ddlPeriod');
            const subCategoryElement = document.getElementById('ddlsubcat');
            if (!categoryElement || !subCategoryElement) {
                throw new Error('Category or Subcategory element not found');
            }
            const categorySelect = categoryElement;
            const subCategorySelect = subCategoryElement;
            categorySelect.value = categoryValue;
            const event1 = new Event('change', { bubbles: true });
            categorySelect.dispatchEvent(event1);
            await new Promise((resolve) => setTimeout(resolve, 500));
            subCategorySelect.value = subCategoryValue;
            const event2 = new Event('change', { bubbles: true });
            subCategorySelect.dispatchEvent(event2);
            await new Promise((resolve) => setTimeout(resolve, 500));
            const submitElement = document.querySelector('input[type="submit"]');
            if (!submitElement) {
                throw new Error('Submit button not found');
            }
            const submitButton = submitElement;
            submitButton.click();
        };

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

        const getTableData = async (document, state) => {
            const tables = document.querySelectorAll('table table tbody tr table.ng-scope');
            const results = Array.from(tables)
                .filter(
                    (row) =>
                        !row.classList.contains('ng-scope') ||
                        !row.classList.contains('__web-inspector-hide-shortcut__'),
                )
                .map((t) => {
                    const timeRow = t.getElementsByTagName('tr')[2];
                    const exchangeReceivedInfo = timeRow.getElementsByTagName('td')[0].innerText;
                    const resultRow = t.getElementsByTagName('tr')[0];
                    const headline = resultRow.getElementsByTagName('td')[0].innerText.trim();
                    const link = resultRow.getElementsByTagName('a')[0].getAttribute('href');
                    const parts = headline.trim().split(' - ');
                    const company = parts[0].trim();
                    const timeStr = exchangeReceivedInfoToTime(exchangeReceivedInfo);

                    return {
                        company,
                        intentType: state,
                        link: `https://www.bseindia.com${link}`,
                        time: timeStr,
                        messageKey: `${company} - ${state} - ${timeStr}`,
                    };
                });
            return results;
        };

        /**
         * Check for results in the 'Award of Order / Receipt of Order' section
         */
        await gotoDocumentState(document, 'Company Update', 'Award of Order / Receipt of Order');

        await new Promise((resolve) => setTimeout(resolve, 2000)); // wait

        while (true) {
            const results = await getTableData(document, 'Orders');
            if (results.length === 0) {
                break;
            }
            bulkResults.push(...results);
            const nextLink = document.querySelector('a[id="idnext"]');
            if (!nextLink) {
                break;
            }
            const nextButton = nextLink;
            nextButton.click();
            await new Promise((resolve) => setTimeout(resolve, 2000)); // wait
        }

        /**
         * Check for outcomes in the 'Board Meeting' section
         */
        await gotoDocumentState(document, 'Board Meeting', 'Outcome of Board Meeting');

        await new Promise((resolve) => setTimeout(resolve, 2000)); // wait

        while (true) {
            const results = await getTableData(document, 'Meetings');
            if (results.length === 0) {
                break;
            }
            bulkResults.push(...results);
            const nextLink = document.querySelector('a[id="idnext"]');
            if (!nextLink) {
                break;
            }
            const nextButton = nextLink;
            nextButton.click();
            await new Promise((resolve) => setTimeout(resolve, 2000)); // wait
        }

        /**
         * Check for entries in the 'Annual General Meeting' section
         */
        await gotoDocumentState(document, 'AGM/EGM', 'AGM');

        await new Promise((resolve) => setTimeout(resolve, 2000)); // wait

        while (true) {
            const results = await getTableData(document, 'AGM');
            if (results.length === 0) {
                break;
            }
            bulkResults.push(...results);
            const nextLink = document.querySelector('a[id="idnext"]');
            if (!nextLink) {
                break;
            }
            const nextButton = nextLink;
            nextButton.click();
            await new Promise((resolve) => setTimeout(resolve, 2000)); // wait
        }

        /**
         * Check for entries in the 'Extra General Meeting' section
         */
        await gotoDocumentState(document, 'AGM/EGM', 'EGM');

        await new Promise((resolve) => setTimeout(resolve, 2000)); // wait

        while (true) {
            const results = await getTableData(document, 'EGM');
            if (results.length === 0) {
                break;
            }
            bulkResults.push(...results);
            const nextLink = document.querySelector('a[id="idnext"]');
            if (!nextLink) {
                break;
            }
            const nextButton = nextLink;
            nextButton.click();
            await new Promise((resolve) => setTimeout(resolve, 2000)); // wait
        }

        /**
         * Check for results section
         */
        await gotoDocumentState(document, 'Result', 'Financial Results');

        await new Promise((resolve) => setTimeout(resolve, 2000)); // wait

        while (true) {
            const results = await getTableData(document, 'Results');
            if (results.length === 0) {
                break;
            }
            bulkResults.push(...results);
            const nextLink = document.querySelector('a[id="idnext"]');
            if (!nextLink) {
                break;
            }
            const nextButton = nextLink;
            nextButton.click();
            await new Promise((resolve) => setTimeout(resolve, 2000)); // wait
        }

        /**
         * Check for results in the 'Integrated Filing' section
         */
        await gotoDocumentState(document, 'Integrated Filing', 'Integrated Filing (Financial)');

        await new Promise((resolve) => setTimeout(resolve, 2000)); // wait

        while (true) {
            const results = await getTableData(document, 'Results');
            if (results.length === 0) {
                break;
            }
            bulkResults.push(...results);
            const nextLink = document.querySelector('a[id="idnext"]');
            if (!nextLink) {
                break;
            }
            const nextButton = nextLink;
            nextButton.click();
            await new Promise((resolve) => setTimeout(resolve, 2000)); // wait
        }

        return bulkResults;
    });
    return results;
};
