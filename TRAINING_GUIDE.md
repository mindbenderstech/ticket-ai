# Training Guide: Fine-tune LLaMA for MongoDB Query Generation

This guide walks you through training your own LLaMA model to convert natural language questions into MongoDB queries.

## Overview

**Goal**: Fine-tune LLaMA 3 8B to generate MongoDB queries from natural language

**Method**: QLoRA (Quantized Low-Rank Adaptation) fine-tuning

**Platform**: Google Colab (Free T4 GPU)

**Time**: ~30-60 minutes for training

## Prerequisites

1. Google account (for Colab)
2. HuggingFace account (free) - [Sign up here](https://huggingface.co/join)
3. Basic understanding of your MongoDB schema

## Step 1: Prepare Your Dataset

### Option A: Use Provided Dataset

We've included a starter dataset with 20 training examples:
- [training/dataset/train_dataset.jsonl](training/dataset/train_dataset.jsonl)
- [training/dataset/test_dataset.jsonl](training/dataset/test_dataset.jsonl)

This is enough for a POC, but for production, you'll want 500+ examples.

### Option B: Generate More Examples

Run the dataset generator:

```bash
cd training/dataset
python dataset_generator.py --num-examples 200 --output train_dataset.jsonl
python dataset_generator.py --num-examples 50 --output test_dataset.jsonl
```

### Option C: Create Custom Examples

Match your actual MongoDB schema. Format:

```json
{"instruction": "Convert the following question to a MongoDB query", "input": "Your question", "output": "{\"field\": \"value\"}"}
```

**Tips for quality data:**
- Use real questions your users ask
- Cover all common query patterns
- Include edge cases
- Ensure MongoDB syntax is correct
- Match your actual field names and values

## Step 2: Get HuggingFace Token

1. Go to https://huggingface.co/settings/tokens
2. Click "New token"
3. Name it "colab-training"
4. Select "Write" access
5. Copy the token (you'll need it in Colab)

## Step 3: Open Google Colab

1. Upload [training/llama_finetune_colab.ipynb](training/llama_finetune_colab.ipynb) to Google Drive
2. Open with Google Colab
3. Go to Runtime → Change runtime type
4. Select **GPU** (T4, L4, or better)
5. Click Save

## Step 4: Run Training Notebook

Follow the notebook cells in order:

### Cell 1-3: Setup
- Installs required libraries (~5 min)
- Imports dependencies
- Sets configuration

### Cell 4: Login to HuggingFace
- Paste your HuggingFace token when prompted
- This gives access to LLaMA 3 model

### Cell 5: Upload Dataset
- Upload your `train_dataset.jsonl`
- Upload your `test_dataset.jsonl`

### Cell 6-11: Prepare & Train
- Loads and formats dataset
- Loads LLaMA 3 8B with 4-bit quantization
- Configures LoRA adapters
- **Starts training (~20-30 min for 3 epochs)**

Watch the training progress:
```
Epoch 1/3: [===>      ] 45% | Loss: 0.234
```

### Cell 12-13: Save Model
- Saves fine-tuned model
- Creates zip file for download

### Cell 14: Test Model
- Tests with example questions
- Verify it generates correct queries

### Cell 15: Download Model
- Downloads `llama3-8b-mongodb-query-generator.zip` (~2-4 GB)
- Save this file locally

## Step 5: Setup Local Inference

### Install Ollama

```bash
cd local_inference
chmod +x setup_local_inference.sh
./setup_local_inference.sh
```

Or manually:
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh
```

### Load Your Model

```bash
# Extract downloaded model
unzip llama3-8b-mongodb-query-generator.zip

# Move to local_inference directory
mv llama3-8b-mongodb-query-generator local_inference/

# Create Ollama model
cd local_inference
ollama create llama3-mongodb -f Modelfile

# Test it
ollama run llama3-mongodb "Show me all high priority tickets"
```

## Step 6: Configure Your Application

Update your `.env` file:

```bash
# Enable local LLM
USE_LOCAL_LLM=true

# Ollama configuration
LOCAL_LLM_URL=http://localhost:11434
LOCAL_MODEL_NAME=llama3-mongodb

# Keep MongoDB config
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=your_database
```

## Step 7: Start Your Application

```bash
# Start Ollama (if not already running)
ollama serve

# In another terminal, start your app
npm install
npm run dev
```

## Step 8: Test End-to-End

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Show me all high priority open tickets"
  }'
```

Expected response:
```json
{
  "success": true,
  "query": {"status": "open", "priority": "high"},
  "resultCount": 5,
  "explanation": "I found 5 high-priority open tickets..."
}
```

## Training Configuration

### Default Settings (Good for POC)

```python
NUM_EPOCHS = 3          # Number of training passes
BATCH_SIZE = 4          # Samples per batch
LEARNING_RATE = 2e-4    # How fast to learn
LORA_R = 16            # LoRA rank
LORA_ALPHA = 32        # LoRA alpha
```

### For Better Results (More data needed)

```python
NUM_EPOCHS = 5          # More epochs
BATCH_SIZE = 8          # Larger batches (needs more VRAM)
LEARNING_RATE = 1e-4    # Lower learning rate
LORA_R = 32            # Higher rank
```

## Troubleshooting

### "CUDA out of memory" in Colab
- Reduce `BATCH_SIZE` to 2 or 1
- Use gradient_accumulation_steps=8

### Model generates invalid JSON
- Add more training examples
- Ensure all training outputs are valid JSON
- Lower temperature during inference (0.1)

### Slow inference locally
- Use quantized model (4-bit or 8-bit)
- Reduce context size
- Use GPU if available

### Poor query accuracy
- Need more training data (aim for 500+ examples)
- Improve data quality and diversity
- Train for more epochs (5-10)
- Include more examples of your specific schema

## Performance Metrics

### Expected Training Time
- **Google Colab T4**: 20-30 minutes (100 examples, 3 epochs)
- **Google Colab L4**: 10-15 minutes
- **Local RTX 4090**: 5-10 minutes

### Expected Accuracy
- **20 examples**: 60-70% (POC only)
- **100 examples**: 75-85% (Good for testing)
- **500+ examples**: 90-95% (Production ready)

### Inference Speed (Local)
- **M1/M2 Mac CPU**: 1-3 seconds
- **M1/M2 Mac GPU**: 0.5-1 seconds
- **RTX 3060**: 0.3-0.8 seconds
- **RTX 4090**: 0.2-0.5 seconds

## Cost Comparison

### Training (One-time)
- **Google Colab Free**: $0 (limited GPU hours)
- **Google Colab Pro**: $10/month (more GPU hours)
- **Cloud GPU (A100)**: ~$2-5 per training run

### Inference (Per 1000 queries)
- **OpenAI GPT-4**: ~$30-60
- **Local LLaMA**: $0 (after hardware)
- **Cloud LLM API**: ~$0.50-5

**Break-even**: After ~1000-2000 queries, local model is cheaper

## Next Steps

1. **Improve Dataset**
   - Collect real user questions
   - Add more edge cases
   - Include complex queries

2. **Fine-tune Further**
   - Train with more examples
   - Adjust hyperparameters
   - Use larger model (70B) if needed

3. **Production Deployment**
   - Set up monitoring
   - Add query validation
   - Implement caching
   - Add fallback to OpenAI

4. **Continuous Improvement**
   - Log user queries
   - Collect feedback
   - Retrain periodically

## Resources

- [LLaMA 3 Model Card](https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct)
- [QLoRA Paper](https://arxiv.org/abs/2305.14314)
- [Ollama Documentation](https://github.com/ollama/ollama)
- [HuggingFace PEFT](https://huggingface.co/docs/peft)

## Support

Issues? Check:
1. [GitHub Issues](https://github.com/mindbenderstech/ticket-ai/issues)
2. [Training Dataset README](training/dataset/README.md)
3. [Local Inference Guide](local_inference/README.md)

Good luck with your training!
