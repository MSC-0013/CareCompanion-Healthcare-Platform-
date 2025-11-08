from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
import os

# --- Initialize FastAPI App ---
app = FastAPI(title="CareCompanion AI API")

# --- Global Variables for Model and Tokenizer ---
model = None
tokenizer = None

# --- Model Configuration ---
MODEL_DIR = "./model" # The folder where your model is stored

# --- Pydantic Model for Request Body ---
class ChatRequest(BaseModel):
    message: str

# --- Load the Model on Startup ---
# This is crucial. We load the model only once when the server starts.
@app.on_event("startup")
def load_model():
    global model, tokenizer
    print("🤖 Loading AI model...")
    try:
        tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
        model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_DIR)
        print("✅ Model loaded successfully!")
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        # In a real app, you might want to exit or handle this more gracefully
        model = None
        tokenizer = None

# --- Health Check Endpoint ---
@app.get("/")
async def root():
    return {"status": "CareCompanion API is running", "model_loaded": model is not None}

# --- Main Chat Endpoint ---
@app.post("/chat")
async def chat(request: ChatRequest):
    if not model or not tokenizer:
        return {"error": "Model is not loaded. Please check the server logs."}

    user_message = request.message
    if not user_message or not user_message.strip():
        return {"error": "Message cannot be empty."}

    try:
        # Construct a prompt to guide the model
        prompt = f"""You are a helpful and professional healthcare assistant AI. Based on the user's question, provide a clear, concise, and helpful answer. Always include a disclaimer to consult a professional.

User's Question: {user_message}

Your Answer:"""

        # Tokenize the input and generate a response
        inputs = tokenizer(prompt, return_tensors="pt")
        
        # Generate the response
        outputs = model.generate(
            **inputs,
            max_length=inputs['input_ids'].shape[1] + 256, # Ensure we don't go too far over
            temperature=0.5,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id
        )
        
        # Decode the response from tokens back to text
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)

        return {"reply": response}

    except Exception as e:
        print(f"Error during generation: {e}")
        return {"error": "An error occurred while generating a response."}

# --- To run this server:
# 1. Make sure you are in the /backend directory
# 2. Install dependencies: pip install -r requirements.txt
# 3. Run the server: uvicorn main:app --reload --host 0.0.0.0 --port 8000