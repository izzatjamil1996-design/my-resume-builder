
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData, Experience } from "../types";

export const enhanceSummary = async (data: Partial<ResumeData>): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Based on the following student information, write a professional, high-impact 3-sentence summary for a resume. Focus on achievements, skills, and career goals.
  Name: ${data.fullName}
  Skills: ${data.skills}
  Education: ${JSON.stringify(data.education)}
  Experience: ${JSON.stringify(data.experiences)}
  ---
  Provide only the summary text. No preamble.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || '';
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Professional summary could not be generated at this time.";
  }
};

export const enhanceExperienceDescription = async (exp: Experience): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Rewrite the following job description for a resume to be more "Applicant Tracking System-friendly" and "action-oriented". 
  STRICT RULE: Use bullet points starting with strong action verbs. Highlight achievements and quantify results if possible.
  Role: ${exp.position} at ${exp.company}
  Raw Description: ${exp.description}
  ---
  Provide only the improved bullet points. No preamble. Use "•" as the bullet point marker.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || '';
  } catch (error) {
    console.error("Gemini Error:", error);
    return exp.description;
  }
};

export const analyzeATSCompatibility = async (resumeData: ResumeData, jobDesc: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Analyze the following resume against the job description for Applicant Tracking System compatibility.
  
  RESUME:
  ${JSON.stringify(resumeData)}

  JOB DESCRIPTION:
  ${jobDesc}

  Provide a score from 0 to 100, specific feedback, and a list of missing keywords.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["score", "feedback", "missingKeywords"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Applicant Tracking System Analysis Error:", error);
    return { score: 0, feedback: "Error analyzing resume.", missingKeywords: [] };
  }
};
