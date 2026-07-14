import axiosInstance from "@/lib/axios";
import { AssessmentBlueprint, Question } from "./AssessmentQuestionRepository";

const generateQuestion = async (
  blueprint: AssessmentBlueprint,
  index: number,
  topic: string,
  difficulty: string,
  excludeTexts?: string[]
): Promise<Question> => {
  const response = await axiosInstance.post(
    `/assessment/generate-question`, 
    { 
      blueprint, 
      index, 
      topic, 
      difficulty,
      language: blueprint.language || "English",
      excludeTexts
    }
  );

  if (response.data && response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data?.error || "Failed to generate question");
};

export class QuestionGenerationEngine {
  
  static async generateWithRetry(
    blueprint: AssessmentBlueprint,
    index: number,
    topic: string,
    difficulty: string,
    excludeTexts: string[] = [],
    maxRetries = 3
  ): Promise<Question> {
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        const question = await generateQuestion(blueprint, index, topic, difficulty, excludeTexts);
        return question;
      } catch (error) {
        attempt++;
        console.warn(`[QuestionGenerationEngine] Failed to generate Q${index + 1}. Attempt ${attempt}/${maxRetries}`, error);
        
        if (attempt >= maxRetries) {
          throw error;
        }
        
        // Exponential backoff: 1s, 2s, 4s...
        const backoffMs = Math.pow(2, attempt - 1) * 1000;
        await new Promise(res => setTimeout(res, backoffMs));
      }
    }
    
    throw new Error("Max retries exceeded");
  }
}
