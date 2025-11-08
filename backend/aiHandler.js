const path = require("path");
const fs = require("fs");
const {
  pipeline,
  AutoTokenizer,
  AutoModelForSeq2SeqLM,
} = require("@xenova/transformers");

const MODEL_DIR = path.resolve(__dirname, "model");
let classifier = null;

const verifyModelFiles = () => {
  const requiredFiles = ["tokenizer.json", "config.json"];
  for (const file of requiredFiles) {
    const filePath = path.join(MODEL_DIR, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`❌ Missing model file: ${file}`);
    }
  }
};

const loadModel = async () => {
  if (classifier) {
    console.log("✅ AI Model already loaded.");
    return;
  }

  try {
    verifyModelFiles();

    const modelURI = `file:///${MODEL_DIR.replace(/\\/g, "/")}`;
    console.log(`🤖 Loading AI model locally from: ${modelURI}`);

    const tokenizer = await AutoTokenizer.from_pretrained(modelURI, {
      local_files_only: true,
    });

    const model = await AutoModelForSeq2SeqLM.from_pretrained(modelURI, {
      local_files_only: true,
    });

    classifier = await pipeline("text2text-generation", model, tokenizer);
    console.log("✅ AI Model loaded successfully (local)!");
  } catch (error) {
    console.error("❌ Failed to load AI model locally:", error.message);
    console.log("🌐 Attempting to download model remotely...");

    try {
      const tokenizer = await AutoTokenizer.from_pretrained("Xenova/distilbart-cnn-6-6");
      const model = await AutoModelForSeq2SeqLM.from_pretrained("Xenova/distilbart-cnn-6-6");
      classifier = await pipeline("text2text-generation", model, tokenizer);
      console.log("✅ Model downloaded and loaded successfully!");
    } catch (err) {
      console.error("❌ Remote model load failed too:", err.message);
      classifier = null;
    }
  }
};

const getAIResponse = async (userMessage) => {
  if (!classifier) {
    await loadModel();
    if (!classifier) throw new Error("AI model not available.");
  }

  const prompt = `
You are a helpful healthcare assistant AI.
Provide clear, concise, and safe responses.
Always include a disclaimer to consult a doctor.

User: ${userMessage}
Answer:
`;

  try {
    const result = await classifier(prompt, {
      max_new_tokens: 256,
      temperature: 0.5,
    });
    return result[0].generated_text;
  } catch (error) {
    console.error("AI generation error:", error.message);
    throw new Error("AI response error");
  }
};

module.exports = { loadModel, getAIResponse };
