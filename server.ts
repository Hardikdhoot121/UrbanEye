import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from 'multer';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Helper function to handle Google GenAI API calls with automatic model switching, exponential backoff, and retries
async function generateContentWithRetry(
  ai: GoogleGenAI,
  contents: any[],
  config: any,
  maxRetries = 3
) {
  let lastError: any = null;
  // Alternate between gemini-3.5-flash and gemini-2.5-flash to route around localized capacity issues
  const models = ["gemini-3.5-flash", "gemini-2.5-flash"];

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const model = models[(attempt - 1) % models.length];
    try {
      console.log(`[Gemini API] Attempt ${attempt}/${maxRetries} using model "${model}"...`);
      const response = await ai.models.generateContent({
        model,
        contents,
        config
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const status = err.status || (err.error && err.error.code) || 500;
      console.warn(`[Gemini API] Attempt ${attempt} failed with status ${status}:`, err.message || err);

      const errorMsg = String(err.message || err).toUpperCase();
      const isTransient = 
        status === 429 || 
        status === 503 || 
        errorMsg.includes("503") || 
        errorMsg.includes("UNAVAILABLE") || 
        errorMsg.includes("HIGH DEMAND") ||
        errorMsg.includes("BUSY") ||
        errorMsg.includes("LIMIT");

      if (isTransient && attempt < maxRetries) {
        const delay = attempt * 1500; // 1.5s, 3.0s delay
        console.log(`[Gemini API] Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw err;
      }
    }
  }
  throw lastError;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Use memory storage for uploaded files to parse multipart/form-data
  const upload = multer({ storage: multer.memoryStorage() });

  // API route for analyzing issue with Gemini
  app.post("/api/gemini/analyze", upload.single("image"), async (req, res) => {
    try {
      const { description } = req.body;
      const file = req.file;

      if (!description && !file) {
        return res.status(400).json({ error: "Either a description or an image is required for analysis." });
      }

      // Initialize GoogleGenAI
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Build model contents
      const contents: any[] = [];

      if (file) {
        contents.push({
          inlineData: {
            mimeType: file.mimetype,
            data: file.buffer.toString("base64")
          }
        });
      }

      const textPrompt = `You are an AI civic dispatcher and analyzer for the 'Community Hero' platform. Analyze the provided description and image of a reported neighborhood issue.
Your task is to classify, assess, and summarize the issue.

Reported Description: "${description || 'No description provided.'}"

Return a structured JSON object with the following fields:
- category: Must be one of: INFRASTRUCTURE, UTILITIES, WASTE_MANAGEMENT, PUBLIC_SAFETY, TRANSPORTATION, ENVIRONMENT, STREETLIGHTS, WATER_SUPPLY, SEWAGE_DRAINAGE, OTHER
- severity: Must be one of: LOW, MEDIUM, HIGH, CRITICAL
- summary: A clear, high-quality, professional summary of the issue.
- confidence: A numeric percentage (between 0 and 100) indicating your confidence in the diagnosis.
- isValidIssue: A boolean indicating whether this is a real civic, infrastructure, or community issue (true) or spam/irrelevant/not an issue (false).
- reason: A concise explanation for your classification and severity assessment.
- suggestedAction: A recommended immediate action or resolution protocol.`;

      contents.push(textPrompt);

      const response = await generateContentWithRetry(
        ai,
        contents,
        {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                enum: [
                  "INFRASTRUCTURE",
                  "UTILITIES",
                  "WASTE_MANAGEMENT",
                  "PUBLIC_SAFETY",
                  "TRANSPORTATION",
                  "ENVIRONMENT",
                  "STREETLIGHTS",
                  "WATER_SUPPLY",
                  "SEWAGE_DRAINAGE",
                  "OTHER"
                ]
              },
              severity: {
                type: Type.STRING,
                enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
              },
              summary: { type: Type.STRING },
              confidence: { type: Type.INTEGER },
              isValidIssue: { type: Type.BOOLEAN },
              reason: { type: Type.STRING },
              suggestedAction: { type: Type.STRING }
            },
            required: ["category", "severity", "summary", "confidence", "isValidIssue", "reason", "suggestedAction"]
          }
        }
      );

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response received from Gemini API.");
      }

      const result = JSON.parse(responseText);
      res.json(result);
    } catch (err: any) {
      console.error("Gemini analyze endpoint error:", err);
      res.status(500).json({ error: err.message || "Internal server error during analysis" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
