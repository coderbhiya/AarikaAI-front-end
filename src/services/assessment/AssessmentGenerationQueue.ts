import type { AssessmentBlueprint, AssessmentQuestionRepository, Question } from "./AssessmentQuestionRepository";
import { QuestionGenerationEngine } from "./QuestionGenerationEngine";
import { isCompanyExam } from "./companyPaper";

export type QuestionStatus = "PENDING" | "GENERATING" | "READY" | "FAILED";

// Compares question texts loosely (case, spacing, punctuation) for duplicate checks.
export const normalizeQuestionText = (text: string) =>
  String(text || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export class AssessmentGenerationQueue {
  private statusMap: Map<number, QuestionStatus> = new Map();
  private PREFETCH_COUNT = 5;
  // Each question generation is a multi-second LLM round trip. Generating the
  // prefetch batch strictly one-at-a-time meant the user could catch up to
  // (and wait on) the generation frontier even with prefetching enabled.
  // A small bounded concurrency gets the current + next question ready much
  // faster without hammering the backend/LLM provider.
  private CONCURRENCY = 3;
  private isProcessing = false;
  // Company tests: the whole paper comes from ONE POST /company-assessment/start
  // per exam session (this queue lives as long as the session's adapter).
  // Concurrent generateOne() calls share the in-flight request; a failed
  // request is dropped so a retry fetches again.
  private paperPromise: Promise<Question[]> | null = null;

  // Plain fields (not constructor parameter properties) so this module also
  // loads under Node's type-stripping TS loader, which the logic tests use.
  private repository: AssessmentQuestionRepository;
  private blueprint: AssessmentBlueprint;
  private onStatusChange?: (index: number, status: QuestionStatus) => void;
  private fetchCompanyPaper: (blueprint: AssessmentBlueprint) => Promise<Question[]>;

  constructor(
    repository: AssessmentQuestionRepository,
    blueprint: AssessmentBlueprint,
    onStatusChange?: (index: number, status: QuestionStatus) => void,
    fetchCompanyPaper: (blueprint: AssessmentBlueprint) => Promise<Question[]> = (bp) =>
      QuestionGenerationEngine.fetchCompanyPaper(bp)
  ) {
    this.repository = repository;
    this.blueprint = blueprint;
    this.onStatusChange = onStatusChange;
    this.fetchCompanyPaper = fetchCompanyPaper;
  }

  public getStatus(index: number): QuestionStatus {
    if (this.repository.hasQuestion(index)) return "READY";
    return this.statusMap.get(index) || "PENDING";
  }

  public async prefetchQuestions(currentIndex: number) {
    for (let i = currentIndex; i < Math.min(currentIndex + this.PREFETCH_COUNT, this.blueprint.questions); i++) {
      if (this.getStatus(i) === "PENDING" || this.getStatus(i) === "FAILED") {
        this.queueQuestion(i);
      }
    }
    this.processQueue();
  }

  public async forceRetry(index: number) {
    if (this.getStatus(index) !== "READY") {
      this.queueQuestion(index);
      this.processQueue();
    }
  }

  private queueQuestion(index: number) {
    if (this.getStatus(index) === "GENERATING" || this.getStatus(index) === "READY") return;
    this.setStatus(index, "PENDING");
  }

  private resolveTopic(index: number): string {
    let topic = "General";
    let accumulatedCount = 0;
    const distributionEntries = Object.entries(this.blueprint.distribution || {});

    for (const [sectionTopic, count] of distributionEntries) {
      accumulatedCount += count;
      if (index < accumulatedCount) {
        topic = sectionTopic;
        break;
      }
    }
    if (distributionEntries.length > 0 && index >= accumulatedCount) {
      topic = distributionEntries[distributionEntries.length - 1][0];
    }
    return topic;
  }

  private resolveDifficulty(index: number): string {
    const totalQs = this.blueprint.questions || 1;
    const easyLimit = Math.round(totalQs * (this.blueprint.difficulty?.easy ? this.blueprint.difficulty.easy / totalQs : 0.3));
    const hardLimit = totalQs - Math.round(totalQs * (this.blueprint.difficulty?.hard ? this.blueprint.difficulty.hard / totalQs : 0.2));

    if (index < easyLimit) return "easy";
    if (index >= hardLimit) return "hard";
    return "medium";
  }

  private loadCompanyPaper(): Promise<Question[]> {
    if (!this.paperPromise) {
      this.paperPromise = this.fetchCompanyPaper(this.blueprint).catch((err) => {
        this.paperPromise = null;
        throw err;
      });
    }
    return this.paperPromise;
  }

  // Saves every paper question at once (persisted with the session), so the
  // rest of the paper is ready immediately and a reload resumes the same paper.
  private storeCompanyPaper(paper: Question[]) {
    const n = Math.min(paper.length, this.blueprint.questions);
    for (let i = 0; i < n; i++) {
      if (!this.repository.hasQuestion(i)) this.repository.saveQuestion(i, paper[i]);
      this.setStatus(i, "READY");
    }
  }

  private async generateOne(index: number) {
    if (isCompanyExam(this.blueprint.exam)) {
      try {
        this.storeCompanyPaper(await this.loadCompanyPaper());
        if (this.repository.hasQuestion(index)) return;
      } catch (error) {
        // Fall through to a generated question for this index, as before.
        console.warn("[AssessmentGenerationQueue] Company paper unavailable, generating instead", error);
      }
    }
    if (this.repository.hasQuestion(index)) {
      this.setStatus(index, "READY");
      return;
    }
    try {
      const topic = this.resolveTopic(index);
      const difficulty = this.resolveDifficulty(index);

      // Questions are generated a few at a time in parallel, each excluding only
      // what was saved when it started, so two of them could come back the same
      // ("questions repeating in mock test"). Check against what is saved *now*
      // and ask again with the duplicate excluded.
      const rejected: string[] = [];
      let question: Question | null = null;
      for (let attempt = 0; attempt < this.MAX_DUPLICATE_RETRIES; attempt++) {
        question = await this.generate(index, topic, difficulty, [...this.repository.getAllQuestionTexts(), ...rejected]);
        const taken = new Set(this.repository.getAllQuestionTexts().map(normalizeQuestionText));
        if (!taken.has(normalizeQuestionText(question.question))) break;
        rejected.push(question.question);
      }

      this.repository.saveQuestion(index, question!);
      this.setStatus(index, "READY");
    } catch (error) {
      console.error(`[AssessmentGenerationQueue] Failed to generate Q${index + 1}`, error);
      this.setStatus(index, "FAILED");
    }
  }

  private MAX_DUPLICATE_RETRIES = 3;

  private generate(index: number, topic: string, difficulty: string, excludeTexts: string[]): Promise<Question> {
    return QuestionGenerationEngine.generateWithRetry(this.blueprint, index, topic, difficulty, excludeTexts);
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (true) {
        const batch: number[] = [];
        for (let i = 0; i < this.blueprint.questions; i++) {
          if (this.statusMap.get(i) === "PENDING") {
            batch.push(i);
            if (batch.length >= this.CONCURRENCY) break;
          }
        }

        if (batch.length === 0) break;

        batch.forEach((index) => this.setStatus(index, "GENERATING"));
        // Generate this batch concurrently instead of one question at a time —
        // cuts wall-clock prefetch time roughly by the concurrency factor.
        await Promise.all(batch.map((index) => this.generateOne(index)));
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private setStatus(index: number, status: QuestionStatus) {
    if (this.statusMap.get(index) === status) return;
    this.statusMap.set(index, status);
    if (this.onStatusChange) {
      this.onStatusChange(index, status);
    }
  }
}
