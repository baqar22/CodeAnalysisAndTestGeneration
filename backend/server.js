import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';
import hfRoutes from './hfRoutes.js';
//import { AzureKeyCredential, OpenAIClient } from '@azure/openai';
import { OpenAI } from "openai";
import router from "./hfRoutes.js";

//const express = require('express');
//const axios = require('axios');
//const dotenv = require('dotenv');
//const cors = require('cors');
// const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");

dotenv.config();
const app = express();
const port = 5001;

app.use(cors());
app.use(express.json()); // To handle JSON request bodies

// Function to get Azure token
async function getAzureToken() {
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.error('[ERROR] Missing AZURE_CLIENT_ID or AZURE_CLIENT_SECRET');
        throw new Error('AZURE_CLIENT_ID and AZURE_CLIENT_SECRET must be set');
    }

    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenUrl = 'https://id.cisco.com/oauth2/default/v1/token';
    const payload = 'grant_type=client_credentials';

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authString}`,
        'Accept': '*/*'
    };

    console.log('[INFO] Sending request to token endpoint:');
    console.log('URL:', tokenUrl);
    console.log('Headers:', headers);
    console.log('Payload:', payload);

    try {
        const response = await axios.post(tokenUrl, payload, { headers });

        console.log('[SUCCESS] Token response received');
        console.log('Status:', response.status);
        console.log('Data:', response.data);

        return response.data.access_token;
    } catch (error) {
        console.error('[ERROR] Token fetch failed');

        if (error.response) {
            console.error('Status Code:', error.response.status);
            console.error('Response Headers:', error.response.headers);
            console.error('Response Body:', error.response.data);
        } else {
            console.error('Request Error:', error.message);
        }

        throw new Error('Failed to fetch Azure token');
    }
}

async function generateAISummary(context, query, role) {
    try {
        const accessToken = await getAzureToken();

        const response = await fetch(
            'https://chat-ai.cisco.com/openai/deployments/gpt-4-turbo/chat/completions?api-version=2024-03-01-preview',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': accessToken,
                    'User': JSON.stringify({ appkey: 'egai-prd-sbg-umbrella-cogs-dev-tools-1' })
                },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: `Task Description:\n${role}` },
                        { role: 'user', content: `Context:\n${context}` },
                        { role: 'user', content: `Prompt:\n${query}` }
                    ],
                    max_tokens: 800,
                    temperature: 0.7,
                    model: 'gpt-4',
                    user: '{"appkey": "egai-prd-sbg-umbrella-cogs-dev-tools-1"}'
                })
            }
        );

        if (!response.ok) {
            console.error('[ERROR] Azure OpenAI API responded with:', response.status);
            const errorText = await response.text();
            console.error('Body:', errorText);
            throw new Error(`Azure OpenAI request failed with ${response.status}`);
        }

        const data = await response.json();
        const summary = data.choices?.[0]?.message?.content;
        return summary;
    } catch (error) {
        console.error('Request Error:', error.message);
        throw new Error('Failed to generate AI summary');
    }
}




// API endpoint to get Azure token
app.get('/api/get-azure-token', async (req, res) => {
    try {
        const token = await getAzureToken();
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API endpoint to generate AI summary
app.post('/api/generate-summary', async (req, res) => {
    const { context, query, role } = req.body;

    try {
        const summary = await generateAISummary(context, query, role);
        res.json({ summary });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/generate-tests', async (req, res) => {
    const { componentCode } = req.body;

    try {
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/Salesforce/codet5p-220m',
            {
                inputs: `
                    You are an expert in React and React Testing Library.
                    
                    Write complete unit tests for the following component using @testing-library/react and Jest. Include test cases for rendering, props, events, and edge cases.
                    
                    React Component:
                    ${componentCode}
                    
                    Respond with code only.
                      `
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
console.log("response", response);
        const result = response.data;
        res.json({ tests: result.generated_text || result[0]?.generated_text || "No output" });
    } catch (err) {
        console.error('[ERROR] HuggingFace API:', err.response?.data || err.message);
        res.status(500).json({ error: 'Failed to generate tests with HuggingFace' });
    }
});

app.use('/api/hf', hfRoutes);

// Start the server
app.listen(port, () => {
    console.log(`✅ Backend server running on http://localhost:${port}`);
});
