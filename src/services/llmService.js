const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate MongoDB query from natural language question
 * @param {string} question - Natural language question
 * @param {string} collection - Target collection name
 * @returns {Promise<{query: Object, explanation: string}>}
 */
async function generateQuery(question, collection = 'tickets') {
  try {
    const prompt = `You are a MongoDB query expert. Convert the following natural language question into a MongoDB query.

Collection: ${collection}

Sample Schema:
{
  "_id": ObjectId,
  "title": String,
  "description": String,
  "status": String (e.g., "open", "in_progress", "closed"),
  "priority": String (e.g., "low", "medium", "high"),
  "assignee": String,
  "createdAt": Date,
  "updatedAt": Date,
  "tags": Array of Strings
}

Question: ${question}

Return ONLY a valid JSON object with two fields:
1. "query": The MongoDB query object (using proper MongoDB query syntax)
2. "explanation": A brief explanation of what the query does

Example format:
{
  "query": { "status": "open", "priority": "high" },
  "explanation": "This query finds all documents where status is 'open' and priority is 'high'"
}

Important:
- Use proper MongoDB operators like $gt, $lt, $gte, $lte, $in, $regex, etc.
- For date ranges, use ISODate format
- Return ONLY the JSON, no additional text`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a MongoDB query generation assistant. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 1000
    });

    const content = response.choices[0].message.content.trim();

    // Try to extract JSON if wrapped in markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || content.match(/(\{[\s\S]*\})/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content;

    const result = JSON.parse(jsonStr);

    return {
      query: result.query,
      explanation: result.explanation
    };

  } catch (error) {
    console.error('LLM query generation error:', error);
    throw new Error(`Failed to generate query: ${error.message}`);
  }
}

module.exports = {
  generateQuery
};
