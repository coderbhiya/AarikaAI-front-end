import axiosInstance from "@/lib/axios";
import { AssessmentBlueprint, Question } from "./AssessmentQuestionRepository";

const generateQuestion = async (
  blueprint: AssessmentBlueprint,
  index: number,
  topic: string,
  difficulty: string,
  excludeTexts?: string[]
): Promise<Question> => {
  const isCompany = (blueprint.exam || "").toLowerCase().includes("google") ||
    (blueprint.exam || "").toLowerCase().includes("tcs") ||
    (blueprint.exam || "").toLowerCase().includes("infosys") ||
    (blueprint.exam || "").toLowerCase().includes("amazon") ||
    (blueprint.exam || "").toLowerCase().includes("meta") ||
    (blueprint.exam || "").toLowerCase().includes("goldman") ||
    (blueprint.exam || "").toLowerCase().includes("accenture");

  if (isCompany) {
    try {
      const compRes = await axiosInstance.post("/company-assessment/start", {
        testName: blueprint.exam || "Google SDE OA",
      });

      if (compRes.data && compRes.data.success && compRes.data.data?.sections) {
        const paper = compRes.data.data;
        const allQuestions: any[] = [];
        paper.sections.forEach((sec: any) => {
          if (sec.questions) allQuestions.push(...sec.questions.map((q: any) => ({ ...q, _sectionType: sec.type })));
        });

        if (allQuestions[index]) {
          const q = allQuestions[index];
          const isCoding = q._sectionType === "coding";
          const base: Question = {
            _id: q.id || index + 1,
            question: q.problemStatement || q.question || "Write an algorithm solution.",
            options: q.options || ["Solution Code"],
            correctAnswer: q.correctAnswer || "Solution Code",
            explanation: q.constraints ? `Constraints: ${q.constraints}` : "Execute code against test cases.",
          };
          if (!isCoding) return base;
          return {
            ...base,
            type: "coding",
            // The question's own test cases — "Run Code" checks against these.
            testCases: Array.isArray(q.sampleTestCases)
              ? q.sampleTestCases
                  .filter((tc: any) => tc && typeof tc.input === "string" && typeof tc.output === "string")
                  .map((tc: any) => ({ input: tc.input, output: tc.output, ...(tc.explanation ? { explanation: tc.explanation } : {}) }))
              : [],
            hiddenTestToken: q.hiddenTestToken || null,
            hiddenTestCount: q.hiddenTestCount || 0,
            testCasesVerified: !!q.testCasesVerified,
            constraints: q.constraints || null,
            solutionContract: q.solutionContract,
            starterCode: q.starterCode,
          };
        }
      }
    } catch (compErr) {
      console.warn("[QuestionGenerationEngine] Company assessment endpoint fallback:", compErr);
    }
  }

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
    // type/maxMarks (mcq vs short_answer/long_answer) are new fields the
    // backend added — default them so older cached responses without these
    // fields still behave as plain MCQ.
    const data = response.data.data;
    return {
      ...data,
      type: data.type || 'mcq',
      maxMarks: data.maxMarks ?? 1,
    };
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
