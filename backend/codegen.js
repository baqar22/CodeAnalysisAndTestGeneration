// backend/codegen.js
const axios = require("axios");

const HF_API_URL = "https://api-inference.huggingface.co/models/codellama/CodeLlama-13b-Instruct-hf";
const HF_TOKEN = process.env.HF_API_TOKEN;

async function generateTestCase(codeSnippet, instruction) {
    const prompt = `${instruction}\n\n${codeSnippet}`;

    const response = await axios.post(
        HF_API_URL,
        { inputs: prompt },
        {
            headers: {
                Authorization: `Bearer ${HF_TOKEN}`,
            },
        }
    );

    return response.data;
}

module.exports = { generateTestCase };
