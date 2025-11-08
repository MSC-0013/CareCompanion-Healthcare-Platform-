import requests
import json

# The API endpoint for Ollama
API_URL = "http://localhost:11434/api/generate"

def chat_with_model(prompt):
    """
    Sends a prompt to the local Ollama model and returns the response.
    """
    # The data we're sending to the API
    payload = {
        "model": "mistral",  # The model you pulled
        "prompt": prompt,
        "stream": False      # Set to False to get the full response at once
    }

    try:
        # Make the POST request to the API
        response = requests.post(API_URL, json=payload)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        # Parse the JSON response
        data = response.json()
        return data.get("response", "Sorry, I couldn't generate a response.")

    except requests.exceptions.RequestException as e:
        return f"Error connecting to the AI model: {e}"
    except json.JSONDecodeError:
        return "Error: Could not decode the response from the AI model."

# --- Main part of your script ---
if __name__ == "__main__":
    print("AI Chatbot is running! Type 'quit' to exit.")
    
    while True:
        user_input = input("You: ")
        if user_input.lower() == 'quit':
            break
        
        ai_response = chat_with_model(user_input)
        print(f"AI: {ai_response}")
