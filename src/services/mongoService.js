const { MongoClient } = require('mongodb');

let client;
let db;

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    if (db) {
      return db;
    }

    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME;

    if (!uri || !dbName) {
      throw new Error('MongoDB configuration missing in environment variables');
    }

    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);

    console.log('Connected to MongoDB successfully');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Execute MongoDB query
 * @param {string} collectionName - Name of the collection
 * @param {Object} query - MongoDB query object
 * @returns {Promise<Array>} Query results
 */
async function executeQuery(collectionName, query) {
  try {
    if (!db) {
      await connectDB();
    }

    const collection = db.collection(collectionName);
    const results = await collection.find(query).toArray();

    return results;
  } catch (error) {
    console.error('Query execution error:', error);
    throw new Error(`Failed to execute query: ${error.message}`);
  }
}

/**
 * Get all collection names
 */
async function getCollections() {
  try {
    if (!db) {
      await connectDB();
    }

    const collections = await db.listCollections().toArray();
    return collections.map(col => col.name);
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }
}

/**
 * Get sample schema from collection
 */
async function getCollectionSchema(collectionName, sampleSize = 5) {
  try {
    if (!db) {
      await connectDB();
    }

    const collection = db.collection(collectionName);
    const samples = await collection.find({}).limit(sampleSize).toArray();

    if (samples.length === 0) {
      return null;
    }

    // Extract field names and types from samples
    const schema = {};
    samples.forEach(doc => {
      Object.keys(doc).forEach(key => {
        if (!schema[key]) {
          schema[key] = typeof doc[key];
        }
      });
    });

    return schema;
  } catch (error) {
    console.error('Error fetching schema:', error);
    throw error;
  }
}

/**
 * Close MongoDB connection
 */
async function closeDB() {
  if (client) {
    await client.close();
    db = null;
    client = null;
    console.log('MongoDB connection closed');
  }
}

module.exports = {
  connectDB,
  executeQuery,
  getCollections,
  getCollectionSchema,
  closeDB
};
