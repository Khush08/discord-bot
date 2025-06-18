import ollama from 'ollama';

const formatOrderPrompt = (data) =>
    `Analyze the following orders data for a company:

    ---
    ${data}
    ---

    Please identify order values, order completion dates, and awarder of order. Present them in a clear and concise manner. Respond using JSON`;

const getOrderAnalysisText = ({ orderValue, orderCompletionDate, awarder }) =>
    `Order Value: ${orderValue}\nOrder Completion Date: ${orderCompletionDate}\nAwarder: ${awarder}`;

export const ollamaOrderAnalysis = async (data) => {
    try {
        const response = await ollama.chat({
            model: 'llama3.2',
            messages: [
                { role: 'system', content: 'You are an expert financial analyst.' },
                { role: 'user', content: formatOrderPrompt(data) },
            ],
            format: {
                type: 'object',
                properties: {
                    orderValue: {
                        type: 'string',
                        description: 'The total value of the order.',
                    },
                    orderCompletionDate: {
                        type: 'string',
                        description: 'The date when the order is expected to be completed.',
                    },
                    awarder: {
                        type: 'string',
                        description: 'The entity or individual who has placed the order.',
                    },
                },
                required: ['orderValue', 'orderCompletionDate', 'awarder'],
            },
            stream: false,
        });

        if (response && response.message && response.message.content) {
            const parsedResponse = JSON.parse(response.message.content);
            return getOrderAnalysisText(parsedResponse);
        } else {
            return getOrderAnalysisText({ orderValue: '', orderCompletionDate: '', awarder: '' });
        }
    } catch (error) {
        console.error('Error in ollamaMeetingAnalysis:', error);
        return getOrderAnalysisText({ orderValue: '', orderCompletionDate: '', awarder: '' });
    }
};
