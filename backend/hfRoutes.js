// hfRoutes.js
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

const HF_API_TOKEN = process.env.HF_API_TOKEN; // Put this in your .env file

// Example: Generate test cases using Hugging Face Code Llama
router.post('/api/generate-tests', async (req, res) => {
    const { componentCode } = req.body;

    try {
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/codellama/CodeLlama-13b-hf',
            {
                inputs: `Generate React unit tests for the following component:\n${componentCode}`
            },
            {
                headers: {
                    Authorization: `Bearer ${HF_API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const result = response.data;
        res.json({ tests: result.generated_text || result[0]?.generated_text || "No output" });
    } catch (err) {
        console.error('[ERROR] HuggingFace API:', err.response?.data || err.message);
        res.status(500).json({ error: 'Failed to generate tests with HuggingFace' });
    }
});

export default router;
