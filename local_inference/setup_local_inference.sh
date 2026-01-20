#!/bin/bash

echo "===== Local LLaMA Inference Setup ====="
echo ""

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "Ollama not found. Installing Ollama..."

    # Install Ollama based on OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        echo "Detected macOS. Downloading Ollama..."
        curl -fsSL https://ollama.com/install.sh | sh
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        echo "Detected Linux. Installing Ollama..."
        curl -fsSL https://ollama.com/install.sh | sh
    else
        echo "Unsupported OS. Please install Ollama manually from https://ollama.com"
        exit 1
    fi
else
    echo "✓ Ollama is already installed"
fi

echo ""
echo "===== Creating Ollama Modelfile ====="

# Create Modelfile for custom model
cat > Modelfile << 'EOF'
FROM ./llama3-8b-mongodb-query-generator

TEMPLATE """<|begin_of_text|><|start_header_id|>system<|end_header_id|>

You are a MongoDB query expert. Convert natural language questions to MongoDB queries.<|eot_id|><|start_header_id|>user<|end_header_id|>

{{ .Prompt }}<|eot_id|><|start_header_id|>assistant<|end_header_id|>

"""

PARAMETER temperature 0.1
PARAMETER top_p 0.9
PARAMETER stop "<|eot_id|>"
PARAMETER stop "<|end_of_text|>"
EOF

echo "✓ Modelfile created"
echo ""
echo "===== Instructions ====="
echo ""
echo "1. After training in Google Colab, download your model zip file"
echo "2. Extract the model: unzip llama3-8b-mongodb-query-generator.zip"
echo "3. Place the extracted folder in this directory (local_inference/)"
echo "4. Run: ollama create llama3-mongodb -f Modelfile"
echo "5. Start the model: ollama run llama3-mongodb"
echo ""
echo "Test the model:"
echo "  curl http://localhost:11434/api/generate -d '{"
echo "    \"model\": \"llama3-mongodb\","
echo "    \"prompt\": \"Show me all high priority tickets\""
echo "  }'"
echo ""
echo "✓ Setup complete!"
