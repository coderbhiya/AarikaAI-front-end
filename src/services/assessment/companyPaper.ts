import type { Question } from "./AssessmentQuestionRepository";

/**
 * Company test papers (POST /company-assessment/start) → simulator questions.
 *
 * A company paper is assembled once per exam session and every question in it
 * is mapped up front, so question N and question N+1 always come from the
 * same paper and each carries an explicit `type`. The simulator decides how to
 * render and score a question from that type, not by guessing from the exam
 * name: an MCQ in "Amazon SDE OA" is an MCQ, not a coding problem.
 */

const COMPANY_EXAM_KEYWORDS = ["google", "tcs", "infosys", "amazon", "meta", "goldman", "accenture"];

export const isCompanyExam = (exam?: string): boolean => {
  const e = (exam || "").toLowerCase();
  return COMPANY_EXAM_KEYWORDS.some((k) => e.includes(k));
};

const BEHAVIORAL_MAX_MARKS = 5;

const mapCodingQuestion = (q: any, fallbackId: number): Question => ({
  _id: q.id || fallbackId,
  type: "coding",
  question: q.problemStatement || q.question || "Write an algorithm solution.",
  options: [],
  correctAnswer: "",
  explanation: q.constraints ? `Constraints: ${q.constraints}` : "",
  // The question's own test cases — "Run Code" and the final score use these.
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
});

// Behavioral prompts (e.g. Amazon's leadership-principles section) are
// written answers graded like any other long-answer question.
const mapBehavioralQuestion = (q: any, fallbackId: number): Question => {
  const competency = q.targetCompetency ? String(q.targetCompetency) : "the competency being assessed";
  return {
    _id: q.id || fallbackId,
    type: "long_answer",
    maxMarks: BEHAVIORAL_MAX_MARKS,
    question: q.scenario || q.question || "Describe a situation that shows how you work.",
    options: [],
    correctAnswer:
      `A strong answer follows the STAR format: the Situation, your Task, the specific Actions you took, and a measurable Result. ` +
      `It clearly demonstrates ${competency}.`,
    explanation:
      `Marks for: a specific real situation (1), your own role and actions rather than the team's (2), ` +
      `a concrete result or lesson (1), and clear evidence of ${competency} (1).`,
  };
};

const mapMcqQuestion = (q: any, fallbackId: number): Question => ({
  _id: q.id || fallbackId,
  type: "mcq",
  question: q.question || q.questionText || "",
  options: Array.isArray(q.options) ? q.options : [],
  correctAnswer: q.correctAnswer || "",
  explanation: q.explanation || "",
});

/** Flattens a company paper into simulator questions, in paper order. */
export const mapCompanyPaper = (paper: any): Question[] => {
  const out: Question[] = [];
  for (const sec of paper?.sections || []) {
    for (const q of sec?.questions || []) {
      const fallbackId = out.length + 1;
      if (sec.type === "coding") out.push(mapCodingQuestion(q, fallbackId));
      else if (sec.type === "behavioral") out.push(mapBehavioralQuestion(q, fallbackId));
      else out.push(mapMcqQuestion(q, fallbackId));
    }
  }
  return out;
};
