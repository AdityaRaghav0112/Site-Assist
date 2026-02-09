require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const pool = require("./db"); // ✅ DB IMPORT

const app = express();

/* ---------------- MIDDLEWARE ---------------- */
app.use(cors());
app.use(express.json());

/* ---------------- ENV CHECK ---------------- */
const API_KEYS = (
  process.env.GEMINI_API_KEYS ||
  process.env.GEMINI_API_KEY ||
  ""
)
  .split(",")
  .map(k => k.trim())
  .filter(Boolean);

if (API_KEYS.length === 0) {
  console.error("❌ No Gemini API key provided");
  process.exit(1);
}

/* ---------------- GEMINI CONFIG ---------------- */
const MODELS_TO_TRY = [
  "gemini-flash-latest",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-1.0-pro",
];

const DEFAULT_GENERATION_CONFIG = {
  temperature: 0.9,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 4096,
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ---------------- GEMINI FALLBACK HANDLER ---------------- */
async function generateWithFallback(contents, options = {}) {
  const maxRetriesPerModel = options.maxRetriesPerModel ?? 2;
  const baseDelayMs = options.baseDelayMs ?? 1000;

  for (const apiKey of API_KEYS) {
    const genAI = new GoogleGenerativeAI(apiKey);

    for (const modelName of MODELS_TO_TRY) {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          ...DEFAULT_GENERATION_CONFIG,
          ...(options.generationConfig || {}),
        },
      });

      for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
        try {
          const result = await model.generateContent({ contents });
          return { result, model: modelName };
        } catch (err) {
          const msg = err?.message || String(err);
          const status = err?.statusCode || err?.status;

          console.warn(
            `⚠️ Gemini error (model=${modelName}, attempt=${attempt}):`,
            msg
          );

          const waitMs = baseDelayMs * Math.pow(2, attempt);
          if (status === 429 || /quota|rate limit/i.test(msg)) {
            await sleep(waitMs);
            continue;
          }

          if (attempt < maxRetriesPerModel) {
            await sleep(waitMs);
            continue;
          }

          break;
        }
      }
    }
  }

  throw new Error("All Gemini models and API keys failed");
}

/* ---------------- GEMINI INTENT HANDLER ---------------- */
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    /* 1️⃣ FETCH AVAILABLE COMMANDS FROM DB */
    const commandsResult = await pool.query("SELECT command FROM tasks");
    const availableCommands = commandsResult.rows.map(row => row.command);

    if (availableCommands.length === 0) {
      return res.json({ reply: "No tasks available in the database." });
    }

    /* 2️⃣ GEMINI INTENT CLASSIFICATION */
    const prompt = `
      You are an intent classifier.
      User Message: "${message}"
      Available Intents: ${JSON.stringify(availableCommands)}

      Your task:
      - Understand the user's message.
      - Match it to one "intent" from the Available Intents list.
      - If nothing matches, return null.

      Rules:
      - Respond with ONLY valid JSON.
      - JSON format: { "intent": "matched_command" or null }
      - Do NOT explain.
      - Do NOT answer the question.
      - Do NOT add extra text.
    `;

    const contents = [{ role: "user", parts: [{ text: prompt }] }];
    const { result } = await generateWithFallback(contents);
    const textResponse = result.response.text();
    
    // Parse JSON response safely
    let jsonResponse;
    try {
        // Remove markdown code blocks if present (Gemini sometimes adds them)
        const cleanText = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        jsonResponse = JSON.parse(cleanText);
    } catch (e) {
        console.error("Failed to parse Gemini JSON:", textResponse);
        return res.json({ reply: "Error understanding request." });
    }

    const matchedIntent = jsonResponse.intent;

    /* 3️⃣ DB LOOKUP BASED ON INTENT */
    if (matchedIntent) {
      const taskResult = await pool.query(
        "SELECT * FROM tasks WHERE command = $1",
        [matchedIntent]
      );

      if (taskResult.rows.length > 0) {
        const row = taskResult.rows[0];
        return res.json({
          reply: row.title || `Here are the steps for: ${row.command}`,
          steps: row.steps,
          buttons: row.buttons || [],
          ...row
        });
      }
    }

    /* 4️⃣ NO MATCH FOUND */
    return res.json({ reply: "out of context" });

  } catch (err) {
    console.error("❌ /api/chat error:", err);
    res.status(500).json({
      reply: "Error processing request",
      error: err.message,
    });
  }
});

/* ---------------- HEALTH CHECK ---------------- */
app.get("/", (req, res) => {
  res.send("✅ Chat server running (DB-first, AI-second)");
});

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
