const express = require('express');
const router = express.Router();
const { executeQuery } = require('../services/mongoService');
const { explainResults } = require('../services/explanationService');

// Choose LLM service based on environment variable
const USE_LOCAL_LLM = process.env.USE_LOCAL_LLM === 'true';
const llmService = USE_LOCAL_LLM
  ? require('../services/localLlmService')
  : require('../services/llmService');

const { generateQuery } = llmService;

/**
 * Main endpoint: Convert natural language to MongoDB query and explain results
 * POST /api/query
 * Body: { "question": "Show me all tickets created last week" }
 */
router.post('/', async (req, res) => {
  try {
    const { question, collection } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    console.log('Received question:', question);

    // Step 1: Generate MongoDB query from natural language
    const { query, explanation: queryExplanation } = await generateQuery(question, collection);
    console.log('Generated query:', JSON.stringify(query, null, 2));

    // Step 2: Execute query on MongoDB
    const results = await executeQuery(collection || 'tickets', query);
    console.log(`Query returned ${results.length} results`);

    // Step 3: Explain results to user
    const explanation = await explainResults(question, query, results);

    // Return complete response
    res.json({
      success: true,
      question,
      query,
      queryExplanation,
      resultCount: results.length,
      results,
      explanation
    });

  } catch (error) {
    console.error('Query processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * Get database schema information
 * GET /api/query/schema
 */
router.get('/schema', async (req, res) => {
  try {
    const { getCollections, getCollectionSchema } = require('../services/mongoService');
    const collections = await getCollections();

    const schemas = {};
    for (const collection of collections) {
      schemas[collection] = await getCollectionSchema(collection);
    }

    res.json({
      success: true,
      collections,
      schemas
    });
  } catch (error) {
    console.error('Schema fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
