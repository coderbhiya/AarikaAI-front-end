import { AssessmentBlueprint, AssessmentQuestionRepository } from "./AssessmentQuestionRepository";
import { QuestionGenerationEngine } from "./QuestionGenerationEngine";

export type QuestionStatus = "PENDING" | "GENERATING" | "READY" | "FAILED";

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

  constructor(
    private repository: AssessmentQuestionRepository,
    private blueprint: AssessmentBlueprint,
    private onStatusChange?: (index: number, status: QuestionStatus) => void
  ) {}

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

  private async generateOne(index: number) {
    try {
      const topic = this.resolveTopic(index);
      const difficulty = this.resolveDifficulty(index);

      const question = await QuestionGenerationEngine.generateWithRetry(
        this.blueprint,
        index,
        topic,
        difficulty,
        this.repository.getAllQuestionTexts()
      );

      this.repository.saveQuestion(index, question);
      this.setStatus(index, "READY");
    } catch (error) {
      console.error(`[AssessmentGenerationQueue] Failed to generate Q${index + 1}`, error);
      this.setStatus(index, "FAILED");
    }
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
