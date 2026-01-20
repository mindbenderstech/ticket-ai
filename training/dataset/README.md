# Training Dataset

This directory contains the training and test datasets for fine-tuning the LLaMA model to convert natural language questions into MongoDB queries.

## Dataset Format

The dataset uses JSONL (JSON Lines) format with the following structure:

```json
{
  "instruction": "Convert the following question to a MongoDB query",
  "input": "Natural language question",
  "output": "MongoDB query as JSON string"
}
```

## Files

- `train_dataset.jsonl` - Training examples (20 samples provided, expand for better results)
- `test_dataset.jsonl` - Test/validation examples (5 samples)
- `dataset_generator.py` - Script to generate more training examples

## Expanding the Dataset

### Manual Addition
Add more examples to `train_dataset.jsonl` following the same format.

### Using the Generator
Run the dataset generator to create more examples:
```bash
python training/dataset/dataset_generator.py --num-examples 100
```

## Best Practices

1. **Diversity**: Include various query patterns:
   - Simple field matching
   - Range queries ($gt, $lt, $gte, $lte)
   - Array operations ($in, $nin)
   - Text search ($regex)
   - Logical operators ($and, $or)
   - Date queries
   - Complex nested queries

2. **Quality over Quantity**:
   - Start with 100-200 high-quality examples
   - For production, aim for 1000+ examples
   - Ensure correct MongoDB syntax

3. **Schema Consistency**: Match your actual MongoDB schema:
   - Field names (status, priority, assignee, etc.)
   - Field types (String, Date, Number)
   - Valid enum values

4. **Real-world Patterns**: Include queries your users actually ask

## Example Schema Reference

```javascript
{
  "_id": ObjectId,
  "title": String,
  "description": String,
  "status": String,  // "open", "in_progress", "closed", "resolved"
  "priority": String,  // "low", "medium", "high", "urgent", "critical"
  "assignee": String,
  "createdBy": String,
  "createdAt": Date,
  "updatedAt": Date,
  "tags": [String],
  "commentCount": Number
}
```

## Training Tips

- Minimum recommended: 100 examples for POC
- Good performance: 500-1000 examples
- Production-ready: 2000+ examples
- Include edge cases and error scenarios
- Validate all output queries are syntactically correct
