# Ticket AI - Natural Language to MongoDB Query System

AI-powered system that converts natural language questions into MongoDB queries, executes them, and explains the results back to users in plain English.

## Architecture

```
UI → API → LLM (Query Generation) → MongoDB Execution → LLM (Result Explanation) → User
```

### Flow

1. **UI calls API** with natural language question
2. **API calls LLM** to generate MongoDB query from the question
3. **Execute query** on MongoDB database
4. **LLM explains results** to user in natural language
5. **Return response** to UI

## Features

- Natural language to MongoDB query conversion
- Automatic query execution
- AI-powered result explanation
- Schema introspection
- RESTful API
- Error handling and validation

## Setup

### Prerequisites

- Node.js 18+
- MongoDB instance
- OpenAI API key (or other LLM provider)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mindbenderstech/ticket-ai.git
cd ticket-ai
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
- `MONGODB_URI`: Your MongoDB connection string
- `MONGODB_DB_NAME`: Database name
- `OPENAI_API_KEY`: Your OpenAI API key

4. Start the server:
```bash
npm run dev
```

## API Endpoints

### POST /api/query

Convert natural language to MongoDB query and get explained results.

**Request:**
```json
{
  "question": "Show me all high priority tickets created last week",
  "collection": "tickets"
}
```

**Response:**
```json
{
  "success": true,
  "question": "Show me all high priority tickets created last week",
  "query": {
    "priority": "high",
    "createdAt": {
      "$gte": "2024-01-13T00:00:00.000Z"
    }
  },
  "queryExplanation": "This query finds all tickets with high priority created after Jan 13, 2024",
  "resultCount": 5,
  "results": [...],
  "explanation": "I found 5 high-priority tickets that were created last week..."
}
```

### GET /api/query/schema

Get database schema information.

**Response:**
```json
{
  "success": true,
  "collections": ["tickets", "users"],
  "schemas": {
    "tickets": {
      "_id": "object",
      "title": "string",
      "status": "string",
      "priority": "string"
    }
  }
}
```

### GET /health

Health check endpoint.

## Example Usage

### Using curl

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Show me all open tickets assigned to John"
  }'
```

### Using JavaScript

```javascript
const response = await fetch('http://localhost:3000/api/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    question: 'Show me all open tickets assigned to John'
  })
});

const data = await response.json();
console.log(data.explanation);
```

## Project Structure

```
ticket-ai/
├── src/
│   ├── server.js                    # Express server setup
│   ├── routes/
│   │   └── queryRoutes.js           # API route handlers
│   └── services/
│       ├── llmService.js            # LLM query generation
│       ├── mongoService.js          # MongoDB operations
│       └── explanationService.js    # Result explanation
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
├── package.json                     # Project dependencies
└── README.md                        # This file
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3000) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `MONGODB_DB_NAME` | Database name | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `OPENAI_MODEL` | OpenAI model to use | No (default: gpt-4) |
| `ALLOWED_ORIGINS` | CORS allowed origins | No |

## Development

### Run in development mode:
```bash
npm run dev
```

### Run in production:
```bash
npm start
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message here",
  "details": "Stack trace (only in development)"
}
```

## Future Enhancements

- [ ] Support for aggregation pipelines
- [ ] Query result caching
- [ ] Rate limiting
- [ ] Authentication & authorization
- [ ] Query history and analytics
- [ ] Support for multiple LLM providers
- [ ] WebSocket support for real-time queries
- [ ] Query validation and sanitization
- [ ] UI dashboard

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub.

## Author

**mindbenderstech**

GitHub: [@mindbenderstech](https://github.com/mindbenderstech)
