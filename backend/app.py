# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from ai_handler import load_model, generate_response

app = Flask(__name__)
CORS(app)  # Enable CORS for your frontend (localhost:5173 / 8080)

# Load model at startup
print("Initializing CareCompanion AI Flask server...")
load_model()


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "CareCompanion Flask API running",
        "model_loaded": True
    })


@app.route("/api/ai/chat", methods=["POST"])
def chat():
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"error": "Message field is required"}), 400

    user_message = data["message"].strip()
    if not user_message:
        return jsonify({"error": "Message cannot be empty"}), 400

    try:
        reply = generate_response(user_message)
        return jsonify({"success": True, "reply": reply})
    except Exception as e:
        print("❌ Error during response generation:", e)
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Failed to generate AI response."
        }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
