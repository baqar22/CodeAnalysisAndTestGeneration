// azureOpenAI.js
import axios from 'axios';

const generateAISummary = async (context, query, role) => {
    try {
        const response = await axios.post('http://localhost:5001/api/generate-summary', {
            context,
            query,
            role
        });

        return response.data.summary;
    } catch (error) {
        console.error('Error generating AI summary:', error);
        return 'Error generating AI summary';
    }
};


export default generateAISummary;
