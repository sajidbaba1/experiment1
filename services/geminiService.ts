import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to check if API key is present
export const isGeminiConfigured = (): boolean => {
  return !!apiKey && apiKey !== 'undefined';
};

export const enhanceTaskDescription = async (title: string, currentDescription: string): Promise<string> => {
  if (!isGeminiConfigured()) return currentDescription;

  try {
    const prompt = `
      You are an expert project manager.
      Task Title: "${title}"
      Current Notes: "${currentDescription}"

      Please generate a professional, clear, and actionable task description based on the title and notes. 
      Include a brief summary and a bulleted list of acceptance criteria if possible. 
      Keep it concise (under 200 words).
      Return ONLY the raw text of the description.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || currentDescription;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return currentDescription;
  }
};

export const suggestSubtasks = async (title: string, description: string): Promise<string[]> => {
  if (!isGeminiConfigured()) return [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a list of 3-5 subtasks for the task: "${title}". Description: "${description}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subtasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const json = JSON.parse(response.text || '{}');
    return json.subtasks || [];
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};