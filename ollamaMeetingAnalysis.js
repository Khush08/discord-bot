import ollama from 'ollama';

const formatMeetingPrompt = (data) =>
    `Analyse the following data from board meeting / AGM meeting / EGM meeting:

    ---
    ${data}
    ---

    Please identify and list the key points discussed in this meeting, that can affect the stock prices. Respond using JSON`;

const getMeetingAnalysisText = ({ keyPoints }) => {
    if (!keyPoints || keyPoints.length === 0) {
        return 'No key points identified from the meeting.';
    }
    return `- ${keyPoints.join('\n- ')}`;
};

export const ollamaMeetingAnalysis = async (data) => {
    try {
        const response = await ollama.chat({
            model: 'llama3.2',
            messages: [
                { role: 'system', content: 'You are an expert financial analyst.' },
                { role: 'user', content: formatMeetingPrompt(data) },
            ],
            format: {
                type: 'object',
                properties: {
                    keyPoints: {
                        type: 'array',
                        items: {
                            // Specifies that each item in the array should be a string
                            type: 'string',
                        },
                        description:
                            'An array of strings, where each string is a key point, decision, or action item from the meeting.',
                    },
                },
                required: ['keyPoints'],
            },
            stream: false,
        });

        if (response && response.message && response.message.content) {
            const parsedResponse = JSON.parse(response.message.content);
            return getMeetingAnalysisText(parsedResponse);
        } else {
            return getMeetingAnalysisText({ keyPoints: [] });
        }
    } catch (error) {
        console.error('Error in ollamaMeetingAnalysis:', error);
        return getMeetingAnalysisText({ keyPoints: [] });
    }
};
