const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Explain query results to user in natural language
 * @param {string} originalQuestion - User's original question
 * @param {Object} query - MongoDB query that was executed
 * @param {Array} results - Query results
 * @returns {Promise<string>} Natural language explanation
 */
async function explainResults(originalQuestion, query, results) {
  try {
    const prompt = `You are a helpful assistant explaining database query results to users.

User's Question: ${originalQuestion}

MongoDB Query Executed: ${JSON.stringify(query, null, 2)}

Number of Results: ${results.length}

Results (showing first 10):
${JSON.stringify(results.slice(0, 10), null, 2)}

Provide a clear, concise explanation to the user about:
1. What data was found
2. Key insights from the results
3. Answer to their original question

Keep the explanation conversational and user-friendly. Focus on the most relevant information.`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that explains database results in clear, simple language.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0].message.content.trim();

  } catch (error) {
    console.error('Result explanation error:', error);

    // Fallback explanation if LLM fails
    return `Found ${results.length} results matching your query. ${
      results.length > 0
        ? 'The query successfully retrieved the requested data from the database.'
        : 'No matching records were found for your query.'
    }`;
  }
}

module.exports = {
  explainResults
};
