# Local Inference Setup

This directory contains everything needed to run your fine-tuned LLaMA model locally for MongoDB query generation.

## Prerequisites

- macOS or Linux
- 8GB+ RAM (16GB recommended)
- GPU with 6GB+ VRAM (optional but recommended for faster inference)

## Setup Steps

### 1. Train the Model in Google Colab

1. Open [llama_finetune_colab.ipynb](../training/llama_finetune_colab.ipynb) in Google Colab
2. Follow all the steps to train your model
3. Download the model zip file at the end
4. Extract: `unzip llama3-8b-mongodb-query-generator.zip`

### 2. Install Ollama

Run the setup script:
```bash
cd local_inference
chmod +x setup_local_inference.sh
./setup_local_inference.sh
```

Or install manually:
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh
```

### 3. Setup Your Model

```bash
# Move your extracted model to this directory
mv /path/to/llama3-8b-mongodb-query-generator ./

# Create Ollama model from your fine-tuned weights
ollama create llama3-mongodb -f Modelfile

# Verify model is created
ollama list
```

### 4. Start the Inference Server

```bash
# Start Ollama server (usually runs automatically)
ollama serve

# In another terminal, run your model
ollama run llama3-mongodb
```

### 5. Test the Model

```bash
# Test via command line
ollama run llama3-mongodb "Show me all high priority tickets"

# Or test via API
curl http://localhost:11434/api/generate -d '{
  "model": "llama3-mongodb",
  "prompt": "Show me all high priority tickets",
  "stream": false
}'
```

### 6. Update Your Application

Update your `.env` file:
```bash
# Use local LLM instead of OpenAI
USE_LOCAL_LLM=true
LOCAL_LLM_URL=http://localhost:11434
LOCAL_MODEL_NAME=llama3-mongodb
```

## Alternative: Using llama.cpp

If you prefer llama.cpp for more control:

### 1. Install llama.cpp

```bash
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make
```

### 2. Convert Model to GGUF

```bash
# Convert your model to GGUF format
python convert.py /path/to/llama3-8b-mongodb-query-generator \
  --outfile llama3-mongodb.gguf \
  --outtype q4_K_M
```

### 3. Run Server

```bash
./server -m llama3-mongodb.gguf \
  --host 0.0.0.0 \
  --port 8080 \
  --ctx-size 2048
```

### 4. Update Environment

```bash
LOCAL_LLM_URL=http://localhost:8080
```

## Inference Performance

Expected inference times on different hardware:

| Hardware | Token/sec | Query Time |
|----------|-----------|------------|
| M1/M2 Mac (CPU) | 20-40 | 1-3s |
| M1/M2 Mac (GPU) | 50-100 | 0.5-1s |
| NVIDIA RTX 3060 | 80-120 | 0.3-0.8s |
| NVIDIA RTX 4090 | 150-250 | 0.2-0.5s |

## Troubleshooting

### Model not loading
```bash
# Check Ollama is running
ollama list

# Recreate model
ollama rm llama3-mongodb
ollama create llama3-mongodb -f Modelfile
```

### Out of memory
```bash
# Use smaller context size
ollama run llama3-mongodb --ctx-size 1024
```

### Slow inference
- Use GPU if available
- Reduce context size
- Use quantized model (4-bit or 8-bit)

### Connection refused
```bash
# Check Ollama is running
ps aux | grep ollama

# Start Ollama
ollama serve
```

## API Endpoints

### Generate Query
```bash
POST http://localhost:11434/api/generate
{
  "model": "llama3-mongodb",
  "prompt": "Your question here",
  "stream": false
}
```

### List Models
```bash
GET http://localhost:11434/api/tags
```

### Check Health
```bash
GET http://localhost:11434/
```

## Resources

- [Ollama Documentation](https://github.com/ollama/ollama)
- [llama.cpp Documentation](https://github.com/ggerganov/llama.cpp)
- [LLaMA Model Card](https://huggingface.co/meta-llama/Meta-Llama-3-8B)

## Next Steps

1. Generate more training data for better accuracy
2. Fine-tune with domain-specific MongoDB schemas
3. Implement query validation and sanitization
4. Add caching for common queries
5. Monitor and log query performance
