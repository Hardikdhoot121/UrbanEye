import { GoogleGenAI, Type } from '@google/genai';

// Convert File to base64 for Gemini API
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // FileReader result includes 'data:image/jpeg;base64,...' 
      // We only want the base64 string
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export async function analyzeIssueWithGemini(description: string, file: File | null) {
  if (!description && !file) {
    throw new Error("Either a description or an image is required for analysis.");
  }

  // Use Vite environment variable
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY environment variable is not configured.");
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  const contents: any[] = [];

  if (file) {
    const base64Data = await fileToBase64(file);
    contents.push({
      inlineData: {
        mimeType: file.type,
        data: base64Data
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

  const model = "gemini-3.5-flash"; // Removed the retry logic for simplicity in frontend, gemini-3.5-flash is stable

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
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
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response received from Gemini API.");
    }

    return JSON.parse(responseText);
  } catch (err: any) {
    console.error("Gemini API error:", err);
    throw new Error(err.message || "Failed to analyze issue with AI.");
  }
}
