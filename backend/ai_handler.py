# -*- coding: utf-8 -*-
import os
import sys
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

# Optional Windows fix for Unicode console
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

# ✅ Correct path for your fine-tuned model
MODEL_DIR = os.path.join(os.path.dirname(__file__), "model", "flan_t5_healthcare", "checkpoint-4000")

model = None
tokenizer = None


def load_model():
    """Load the fine-tuned healthcare model"""
    global model, tokenizer
    if model and tokenizer:
        print("[FLASK] Model already loaded.")
        return model, tokenizer

    try:
        print(f"[FLASK] Loading fine-tuned model from {MODEL_DIR} ...")
        tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR, local_files_only=True)
        model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_DIR, local_files_only=True)
        model.eval()
        print("[FLASK] Model loaded successfully from local files.")
    except Exception as e:
        print(f"[FLASK] Local model load failed: {e}")
        print("[FLASK] Attempting to load fallback model (Flan-T5 base)...")
        tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-base")
        model = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-base")
        model.eval()
        print("[FLASK] Fallback model loaded successfully.")

    return model, tokenizer


def generate_response(user_message: str) -> str:
    """Generate a text response from the healthcare AI model"""
    global model, tokenizer
    if not model or not tokenizer:
        load_model()

    # Construct clear healthcare prompt
    prompt = (
        f"You are CareCompanion, a professional AI healthcare assistant.\n"
        f"Provide accurate, concise, and safe advice.\n"
        f"Always include a disclaimer reminding to consult a medical professional.\n\n"
        f"User: {user_message}\nAI:"
    )

    inputs = tokenizer(prompt, return_tensors="pt", truncation=True).to(model.device)

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=256,
            temperature=0.5,
            top_p=0.9,
            do_sample=True,
            repetition_penalty=1.2,
            pad_token_id=tokenizer.eos_token_id,
        )

    reply = tokenizer.decode(outputs[0], skip_special_tokens=True).strip()

    if "consult" not in reply.lower():
        reply += "\n\nDisclaimer: This information is for educational purposes only. Always consult a qualified doctor."

    return reply
