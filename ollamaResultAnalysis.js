import ollama from 'ollama';

const formatResultPrompt = (data) =>
    `Analyze the following quarterly results data for a company:

    ---
    ${data}
    ---

    The report contains quarterly results for a company.
    Identify the revenue (or revenue from operations), total expenses, net profit (or profit after tax), and basic earnings per share (EPS) for:
    1. The most recent quarter mentioned (Current Quarter).
    2. The immediately preceding quarter (Previous Quarter).
    3. The corresponding quarter in the previous year (Previous Year's Same Quarter).

    Also, identify key points, decisions, or financial highlights discussed that could significantly affect the company's stock price or future outlook. 
    These could be from management commentary or results analysis sections.

    Respond using JSON`;

const getResultAnalysisText = ({
    currentQuarter,
    previousQuarter,
    previousYearSameQuarter,
    keyPoints,
}) => {
    const qoqComparison = `**QoQ:**
    - **Revenue:** ${currentQuarter.revenue} vs ${previousQuarter.revenue}\n
    - **Expenses:** ${currentQuarter.expenses} vs ${previousQuarter.expenses}\n
    - **Net Profit:** ${currentQuarter.netProfit} vs ${previousQuarter.netProfit}\n
    - **EPS:** ${currentQuarter.eps} vs ${previousQuarter.eps}\n
    `;

    const yoyComparison = `**YoY:**
    - **Revenue:** ${currentQuarter.revenue} vs ${previousYearSameQuarter.revenue}\n
    - **Expenses:** ${currentQuarter.expenses} vs ${previousYearSameQuarter.expenses}\n
    - **Net Profit:** ${currentQuarter.netProfit} vs ${previousYearSameQuarter.netProfit}\n
    - **EPS:** ${currentQuarter.eps} vs ${previousYearSameQuarter.eps}\n
    `;
    const keyPointsText = `**Key Points:**
    - ${keyPoints.join('\n- ')}
    `;
    return `${qoqComparison}\n\n${yoyComparison}\n\n${keyPointsText}`;
};

export const ollamaResultAnalysis = async (data) => {
    try {
        const response = await ollama.chat({
            model: 'llama3.2',
            messages: [
                { role: 'system', content: 'You are an expert financial analyst.' },
                { role: 'user', content: formatResultPrompt(data) },
            ],
            format: {
                type: 'object',
                properties: {
                    currentQuarter: {
                        type: 'object',
                        properties: {
                            revenue: {
                                type: 'string',
                                description:
                                    'Current Quarter Revenue numbers only, returns N/A if not found.',
                            },
                            netProfit: {
                                type: 'string',
                                description:
                                    'Current Quarter Net Profit numbers only, returns N/A if not found.',
                            },
                            expenses: {
                                type: 'string',
                                description:
                                    'Current Quarter Expenses numbers only, returns N/A if not found.',
                            },
                            eps: {
                                type: 'string',
                                description:
                                    'Current Quarter EPS numbers only, returns N/A if not found.',
                            },
                        },
                        required: ['revenue', 'netProfit', 'expenses', 'eps'],
                        description:
                            'An object containing the financial metrics for the current quarter, including revenue, net profit, expenses, and EPS.',
                    },
                    previousQuarter: {
                        type: 'object',
                        properties: {
                            revenue: {
                                type: 'string',
                                description:
                                    'Previous Quarter Revenue numbers only, returns N/A if not found.',
                            },
                            netProfit: {
                                type: 'string',
                                description:
                                    'Previous Quarter Net Profit numbers only, returns N/A if not found.',
                            },
                            expenses: {
                                type: 'string',
                                description:
                                    'Previous Quarter Expenses numbers only, returns N/A if not found.',
                            },
                            eps: {
                                type: 'string',
                                description:
                                    'Previous Quarter EPS numbers only, returns N/A if not found.',
                            },
                        },
                        required: ['revenue', 'netProfit', 'expenses', 'eps'],
                        description:
                            'An object containing the financial metrics for the previous quarter, including revenue, net profit, expenses, and EPS.',
                    },
                    previousYearSameQuarter: {
                        type: 'object',
                        properties: {
                            revenue: {
                                type: 'string',
                                description:
                                    'Previous Year Same Quarter Revenue numbers only, returns N/A if not found.',
                            },
                            netProfit: {
                                type: 'string',
                                description:
                                    'Previous Year Same Quarter Net Profit numbers only, returns N/A if not found.',
                            },
                            expenses: {
                                type: 'string',
                                description:
                                    'Previous Year Same Quarter Expenses numbers only, returns N/A if not found.',
                            },
                            eps: {
                                type: 'string',
                                description:
                                    'Previous Year Same Quarter EPS numbers only, returns N/A if not found.',
                            },
                        },
                        required: ['revenue', 'netProfit', 'expenses', 'eps'],
                        description:
                            'An object containing the financial metrics for the same quarter in the previous year, including revenue, net profit, expenses, and EPS.',
                    },
                    keyPoints: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                        description:
                            "An array of strings, where each string is an important point, decision, or financial highlight discussed in the results that could significantly affect the company's stock price or future outlook.",
                    },
                },
                required: [
                    'currentQuarter',
                    'previousQuarter',
                    'previousYearSameQuarter',
                    'keyPoints',
                ],
            },
            stream: false,
        });

        if (response && response.message && response.message.content) {
            const parsedResponse = JSON.parse(response.message.content);
            return getResultAnalysisText(parsedResponse);
        } else {
            return getResultAnalysisText({ qoqComparison: '', yoyComparison: '', keyPoints: [] });
        }
    } catch (error) {
        console.error('Error in ollamaMeetingAnalysis:', error);
        return getResultAnalysisText({ qoqComparison: '', yoyComparison: '', keyPoints: [] });
    }
};
