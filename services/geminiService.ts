import { GoogleGenAI, Type } from "@google/genai";
import { StravaActivity, AIAnalysisResult } from '../types';

// We use the environment variable as mandated.
const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const analyzeActivityWithGemini = async (activity: StravaActivity): Promise<AIAnalysisResult> => {
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Cannot perform analysis.");
  }

  const prompt = `
    Analyze the following Strava activity data for an athlete.
    Activity Name: ${activity.name}
    Type: ${activity.type}
    Distance: ${(activity.distance / 1000).toFixed(2)} km
    Moving Time: ${(activity.moving_time / 60).toFixed(1)} minutes
    Elevation Gain: ${activity.total_elevation_gain} meters
    Avg Speed: ${(activity.average_speed * 3.6).toFixed(1)} km/h
    Avg HR: ${activity.average_heartrate || 'N/A'} bpm
    Max HR: ${activity.max_heartrate || 'N/A'} bpm
    Suffer Score: ${activity.suffer_score || 'N/A'}
    Achievements: ${activity.achievement_count}

    Provide a coaching summary, identify key strengths in this session, point out potential weaknesses or areas of caution, and give one actionable piece of advice for the next training session.
    Return the response as a valid JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            advice: { type: Type.STRING },
          },
          required: ["summary", "strengths", "weaknesses", "advice"]
        }
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Failed", error);
    throw new Error("Failed to generate AI analysis.");
  }
};
