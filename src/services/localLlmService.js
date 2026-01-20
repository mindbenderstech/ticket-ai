const axios = require('axios');

/**
 * Local LLM Service using Ollama or llama.cpp server
 * This service connects to a locally running LLM inference server
 */

const LOCAL_LLM_URL = process.env.LOCAL_LLM_URL || 'http://localhost:11434';
const MODEL_NAME = process.env.LOCAL_MODEL_NAME || 'llama3-mongodb';

/**
 * Generate MongoDB query using local LLaMA model
 * @param {string} question - Natural language question
 * @param {string} collection - Target collection name
 * @returns {Promise<{query: Object, explanation: string}>}
 */
async function generateQuery(question, collection = 'tickets') {
  try {
    const prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>

You are a MongoDB query expert. Convert natural language questions to MongoDB queries. Return ONLY a valid JSON object with the MongoDB query, no additional text.<|eot_id|><|start_header_id|>user<|end_header_id|>

Convert the following question to a MongoDB query for the "${collection}" collection.

Question: ${question}

Return ONLY the MongoDB query as a JSON object.<|eot_id|><|start_header_id|>assistant<|end_header_id|>

`;

    // Call local Ollama API
    const response = await axios.post(`${LOCAL_LLM_URL}/api/generate`, {
      model: MODEL_NAME,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.1,
        top_p: 0.9,
        max_tokens: 500
      }
    }, {
      timeout: 30000 // 30 second timeout
    });

    const generatedText = response.data.response.trim();

    // Extract JSON from response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON query from model response');
    }

    const query = JSON.parse(jsonMatch[0]);

    return {
      query: query,
      explanation: `Generated query to find documents matching: ${question}`
    };

  } catch (error) {
    console.error('Local LLM query generation error:', error.message);

    // Fallback to simple query if LLM fails
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Local LLM server is not running. Please start Ollama or llama.cpp server.');
    }

    throw new Error(`Failed to generate query: ${error.message}`);
  }
}

/**
 * Check if local LLM server is running
 */
async function checkHealth() {
  try {
    const response = await axios.get(`${LOCAL_LLM_URL}/api/tags`, {
      timeout: 5000
    });
    return {
      status: 'healthy',
      models: response.data.models || []
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

module.exports = {
  generateQuery,
  checkHealth
};
