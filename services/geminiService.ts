import { GoogleGenAI, Type } from "@google/genai";
import { Task, TaskPriority, TaskStatus, Comment } from "../types";

const apiKey = AIzaSyASJbJhZdKBZW-i9bNi1T8wo9uSg9p4Les || 'AIzaSyB9yl8KozakSCYkYsygApYKtBdA1CXA9jM' ||AIzaSyB9yl8KozakSCYkYsygApYKtBdA1CXA9jM ;
const ai = new GoogleGenAI({ apiKey });

// Helper to check if API key is present
export const isGeminiConfigured = (): boolean => {
  return !!apiKey && apiKey !== 'undefined';
};

// --- Feature 1: Description Enhancement ---
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

// --- Feature 2: Subtask Suggestion ---
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

// --- Feature 7: AI Task Generator (Sprint Planning) ---
export const generateSprintTasks = async (goal: string, existingUsers: string[]): Promise<Partial<Task>[]> => {
  if (!isGeminiConfigured()) return [];

  try {
    const prompt = `
      Create a detailed sprint plan for the following goal: "${goal}".
      Generate 4 to 8 distinct tasks.
      Available assignees: ${existingUsers.join(', ')}.
      
      Return a JSON array of tasks with the following fields:
      - title
      - description (short)
      - status (mostly 'To Do')
      - priority (High, Medium, Low)
      - assignee (pick from available, or null)
      - estimatedTime (in hours, numbers only)
      - tags (array of strings)
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              status: { type: Type.STRING },
              priority: { type: Type.STRING },
              assignee: { type: Type.STRING },
              estimatedTime: { type: Type.NUMBER },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      }
    });

    const json = JSON.parse(response.text || '[]');
    return json as Partial<Task>[];
  } catch (error) {
    console.error("Gemini Sprint Gen Error:", error);
    return [];
  }
};

// --- Feature 8: Comment Summarization ---
export const summarizeComments = async (comments: Comment[]): Promise<string> => {
  if (!isGeminiConfigured() || comments.length === 0) return "No comments to summarize.";

  try {
    const commentsText = comments.map(c => `${c.author}: ${c.text}`).join('\n');
    const prompt = `Summarize the following discussion thread into 2-3 key sentences, highlighting any decisions made:\n\n${commentsText}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not summarize.";
  } catch (error) {
    return "Error summarizing comments.";
  }
};

// --- Feature 9: AI Daily Reports ---
export const generateProjectReport = async (tasks: Task[]): Promise<string> => {
  if (!isGeminiConfigured()) return "AI is not configured.";

  try {
    // Simplify task object to save tokens
    const simplifiedTasks = tasks.map(t => ({
      title: t.title,
      status: t.status,
      priority: t.priority,
      assignee: t.assignee || 'Unassigned',
      due: t.dueDate
    }));

    const prompt = `
      You are a Project Manager Assistant. Analyze this JSON task list:
      ${JSON.stringify(simplifiedTasks)}

      Write a "Daily Executive Briefing" in Markdown format.
      Include:
      1. A one-sentence health check of the project.
      2. Key accomplishments (Done tasks).
      3. Critical blockers or high-priority items still in progress.
      4. A specific shoutout to a team member carrying a heavy load.
      
      Keep it professional but encouraging.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Report generation failed.";
  } catch (error) {
    console.error("Report Gen Error:", error);
    return "Failed to generate report.";
  }
};

// --- Feature 10: AI Assistant Chat ---
export const getChatResponse = async (message: string, tasks: Task[], history: any[]): Promise<string> => {
  if (!isGeminiConfigured()) return "I'm offline right now. Please check API Key.";

  try {
     // Create a minimal context of the project
     const projectContext = tasks.map(t => 
      `[${t.status}] ${t.title} (Assigned: ${t.assignee || 'None'}, Priority: ${t.priority})`
    ).join('\n');

    const systemInstruction = `
      You are TaskFlow Bot, a helpful project assistant.
      Here is the current state of the project tasks:
      ${projectContext}

      Answer the user's questions based *strictly* on this data.
      If asked to count, count carefully.
      If asked for a summary, be brief.
      If asked about a specific person, filter by their name.
      You cannot modify tasks, only read them.
    `;

    // Convert history to Gemini format if needed, for now we just use single turn with context injection for simplicity in this demo
    // or use chat session. Let's use generateContent for single turn stateless simplicity with context.
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Context:\n${systemInstruction}\n\nUser Question: ${message}`,
    });

    return response.text || "I didn't catch that.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Sorry, I encountered an error processing your request.";
  }
};

// --- Feature 11: AI Auto-Assign ---
export const autoAssignTasks = async (unassignedTasks: Task[], users: string[]): Promise<Record<string, string>> => {
  if (!isGeminiConfigured() || unassignedTasks.length === 0) return {};

  try {
    const prompt = `
      I have the following unassigned tasks:
      ${JSON.stringify(unassignedTasks.map(t => ({ id: t.id, title: t.title, tags: t.tags })))}

      The available team members are: ${users.join(', ')}.

      Please assign these tasks to the most suitable team member based on tags/title context (e.g. 'Dev' to a dev, 'Design' to a designer). 
      If you are unsure, distribute evenly.
      
      Return a JSON object where the key is the task ID and the value is the assignee name.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          additionalProperties: { type: Type.STRING }
        }
      }
    });

    const json = JSON.parse(response.text || '{}');
    return json;
  } catch (error) {
    console.error("Auto Assign Error:", error);
    return {};
  }
};
