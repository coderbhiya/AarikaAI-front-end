import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const architectureGuideMarkdown = `# AarikaAI: Enterprise Architecture & Production Infrastructure Guide
*Version 1.0.0 | Institutional-Grade System Design & Deployment Blueprint*

---

## 1. EXECUTIVE OVERVIEW

AarikaAI is a production-grade, AI-native Career Intelligence Operating System designed to act as a hyper-personalized, execution-focused career strategist. Unlike generic educational AI tutors or wrappers, AarikaAI is engineered with a **Strict Orchestration Architecture** that decouples intent classification, behavioral memory extraction, RAG retrieval, and execution-first reasoning into specialized micro-engines.

### Core Architecture Principles
- **Execution-First Reasoning**: Prioritizes shipping, leveraging unfair advantages, and employability over theoretical academic pathways.
- **Progressive Intelligence**: Restrains psychological profiling and deep memory continuity until a user has built sufficient trust (Comfort Score) and session maturity.
- **UX Safety & Restraint**: Employs rigorous fatigue guards and safety overrides to prevent "creepy" over-personalization and clinical tone.
- **Cost-Optimized Routing**: Defaults to "Lightweight Mode" for casual interactions, bypassing expensive embedding, RAG, and confidence-scoring pipelines unless the intent strictly demands it.

---

## 2. COMPLETE SYSTEM ARCHITECTURE

AarikaAI is built on a scalable Node.js/Express backend, a PostgreSQL/PGVector data layer, a BullMQ/Redis asynchronous queue system, and a React frontend, integrated with OpenAI (LangChain).

### High-Level Component Flow
1. **Frontend (React)**: Maintains an SSE (Server-Sent Events) connection for real-time streaming and progress indicators.
2. **Backend Gateway (Node/Express)**: Handles auth, rate limiting, and SSE initialization.
3. **Intelligence Router**: The traffic controller. Analyzes intent to determine which AI subsystems (RAG, Web Search, Memory, Recommendations) should activate.
4. **Retrieval Orchestrator**: Executes parallel lookups across PostgreSQL (Vector Memory), Career Graph, and Document Chunks, gated by the Depth Controller.
5. **Context Synthesizer**: Compresses noisy retrieval data into dense leverage points.
6. **LangChain Execution Pipeline**: Applies execution-first prompt directives and generates the response.
7. **Pre-Streaming Validator**: Checks for hallucinations before emitting text chunks over SSE.
8. **Asynchronous Memory Queue**: BullMQ background workers silently extract semantic facts and behavioral patterns from the conversation *only if allowed by the router*.

---

## 3. AI ORCHESTRATION FLOW

The runtime lifecycle of a chat interaction follows strict deterministic boundaries:

1. **\`queryIntentEngine.js\`**: Uses structured LLM output to classify the raw user query into one of 25+ specific intents (e.g., \`roadmap_generation\`, \`emotional_support\`) and measures \`urgency\` and \`confidenceLevel\`.
2. **\`intelligenceRouter.js\`**: Takes the intent and conversation stage (e.g., \`onboarding\`, \`guidance\`) to generate a \`routingPlan\`. It defaults to \`isLightweightMode: true\`.
3. **\`hardIntentOverrideEngine.js\`**: A safety valve. If a user demands a roadmap during onboarding, this engine overrides stage restrictions.
4. **\`retrievalOrchestrator.js\`**: Listens to the \`routingPlan\`. If RAG or Web Search is disabled, it skips those expensive API calls.
5. **\`contextSynthesizer.js\`**: Compresses multi-source data (Docs, Memories) into Unfair Advantages and Leverage Points.
6. **\`executionStrategyEngine.js\`**: Intercepts roadmap requests, classifies the user's specific archetype (e.g., AI Product Engineer), and injects execution-first directives.
7. **\`recommendationConfidenceEngine.js\`**: (If allowed by the router) calculates a 1-100% confidence score based on the delta between the user's skills and the target role.
8. **\`preStreamingValidation.js\` & \`safeStreamingEngine.js\`**: The response is verified against the grounded context before being streamed safely to the client.

---

## 4. MEMORY & CONTINUITY SYSTEM

Aarika operates a persistent semantic memory layer that evolves with the user, protected by psychological safety restraints.

- **Storage**: Memories are stored in PostgreSQL (\`CareerMemory\` table) with \`pgvector\` embeddings for semantic retrieval.
- **Asynchronous Extraction**: The \`memoryQueue\` (BullMQ) processes past chat turns in the background, extracting factual updates and behavioral patterns without blocking the UI response.
- **\`intelligenceDepthController.js\` & \`userComfortEngine.js\`**: New users receive a low comfort score, limiting vector retrieval to \`maxMemories: 1\`. As they interact more, the depth profile upgrades to \`deep\`, allowing robust historical continuity.
- **\`continuityIntelligenceEngine.js\` & \`intelligenceFatigueGuard.js\`**: Stale memories are retrieved to simulate natural follow-ups ("How did that interview go?"). The fatigue guard limits these callbacks to \`< 2 per session\` to prevent clinginess.
- **\`softInferenceEngine.js\`**: Converts harsh psychological labels generated in the background (e.g., "imposter syndrome") into conversational, softened context for the final prompt.

---

## 5. PROMPT ARCHITECTURE

The prompt hierarchy is modular, dynamic, and strictly separated:
- **Base Persona**: Core role definition ("You are AarikaAI...").
- **Dynamic User Context**: Injected by the orchestrator (Skills, Experience, Target Role).
- **Synthesized RAG Context**: Factual facts and Unfair Advantages.
- **\`executionStrategyEngine\` Directives**: Forces the LLM to focus on shipping products and leveraging existing skills, expressly blocking generic tutorial advice.
- **\`lightweightModeEngine\`**: If active, appends a directive to keep responses under 3 sentences and highly conversational.
- **\`psychologicalSafetyGuard\`**: The final append: *"DO NOT sound like a clinical therapist."*

---

## 6. DATABASE ARCHITECTURE

**Primary Database: PostgreSQL**
- **User Models**: \`User\`, \`UserProfile\`, \`UserSkill\`, \`Experience\`. Relational structures tracking deterministic career data.
- **Vector Storage (\`pgvector\`)**: 
  - \`CareerMemory\`: Stores extracted semantic memories with metadata filters (Type, Importance, Date).
  - \`DocumentChunk\`: Stores chunked resumes/PDFs for document RAG.
- **Indexing Strategy**: HNSW (Hierarchical Navigable Small World) indexes are applied to the vector columns in \`CareerMemory\` and \`DocumentChunk\` to guarantee sub-millisecond retrieval even at scale.
- **Connection Pooling**: PgBouncer or similar pooling is mandatory in production to handle high concurrency, especially since background workers also open connections.

---

## 7. DOCUMENT RAG SYSTEM

1. **Upload & Processing**: PDF/Docx files are parsed via an asynchronous background job.
2. **Chunking**: Text is split recursively (e.g., LangChain RecursiveCharacterTextSplitter) to maintain semantic boundaries.
3. **Embedding**: OpenAI \`text-embedding-3-small\` generates vectors.
4. **Storage**: Stored in \`DocumentChunk\` with the \`documentId\` and \`userId\` as mandatory filters for multi-tenant isolation.
5. **Retrieval**: During \`retrievalOrchestrator\` execution, similarity search retrieves the top-K chunks, which are then passed to the \`contextSynthesizer\` for deduplication and compression.

---

## 8. DEPLOYMENT ARCHITECTURE

### Production Stack (Containerized)
- **Application Server**: Node.js managed via PM2 inside Docker containers.
- **Reverse Proxy**: NGINX handling SSL termination, rate limiting, and HTTP/2 proxying (crucial for reliable SSE streaming).
- **Database**: Managed PostgreSQL (AWS RDS or GCP Cloud SQL) with the \`pgvector\` extension enabled.
- **Cache & Queue**: Managed Redis instance (AWS ElastiCache or GCP Memorystore) backing BullMQ.

### WebSockets / SSE Handling
- Ensure NGINX proxy settings have \`proxy_buffering off;\` and \`proxy_cache off;\` to prevent stream freezing. Load balancers must support long-lived connections for SSE.

---

## 9. CLOUD INFRASTRUCTURE PLAN (AWS / GCP)

- **Compute**: Autoscaling Group of EC2 instances or GCP Cloud Run / ECS Fargate for stateless application nodes.
- **Database**: AWS Aurora PostgreSQL / GCP Cloud SQL for PostgreSQL. Highly available multi-AZ setup.
- **Queue**: AWS ElastiCache for Redis (cluster mode disabled, high availability enabled).
- **Object Storage**: S3 / GCS for storing raw uploaded resumes and user artifacts.
- **CDN**: Cloudflare or AWS CloudFront for static frontend assets and edge caching.

---

## 10. SECURITY ARCHITECTURE

- **Multi-Tenant Isolation**: EVERY vector DB query and row lookup rigidly enforces \`userId = ?\`.
- **Authentication**: JWT-based stateless authentication with short-lived access tokens and httpOnly refresh cookies.
- **\`aiSafetyGuard.js\`**: Intercepts prompt injection attacks, jailbreak attempts, and toxic loops before the LLM is invoked.
- **Rate Limiting**: Redis-backed rate limiting per IP and per User ID to prevent token exhaustion attacks.

---

## 11. OBSERVABILITY & MONITORING

- **Logs**: Winston/Pino structured JSON logging shipped to Datadog, ELK, or AWS CloudWatch.
- **Tracing & APM**: Datadog APM to track the latency of the multi-step \`retrievalOrchestrator\` (Database vs. OpenAI vs. Tavily).
- **Custom Metrics**: 
  - Token usage per route.
  - Hallucination rejection rate (\`preStreamingValidation.js\`).
  - Routing decisions (Track % of queries utilizing Lightweight Mode).
- **Alerts**: PagerDuty alerts on BullMQ queue stalls or sudden spikes in OpenAI 5xx errors.

---

## 12. PERFORMANCE OPTIMIZATION

- **Lightweight Mode**: The biggest cost and latency saver. Bypasses 80% of RAG processing for casual queries.
- **Embedding Batching**: Document RAG chunks are embedded in batches of 100 to avoid rate limits and reduce network latency.
- **Context Compression**: The \`contextSynthesizer.js\` uses \`gpt-4o-mini\` to compress raw chunks into dense markdown. This spends a tiny amount of tokens upfront to save thousands of tokens on the final expensive reasoning pass.
- **Circuit Breakers**: \`circuitBreakerEngine.js\` wraps Vector DB, Web Search, and LLM calls with timeouts (e.g., 3000ms). If a secondary service is slow, it degrades gracefully rather than hanging the user's stream.

---

## 13. FAILURE RECOVERY & RESILIENCE

- **Background Queue Retries**: Memory extraction uses exponential backoff in BullMQ. If OpenAI timeouts, it retries safely in the background.
- **Degraded RAG**: If Tavily web search fails or PGVector times out, the \`circuitBreakerEngine\` catches the error, returns empty arrays, and allows the LLM to answer using only explicit prompt context.
- **Safe Streaming Engine**: Prevents mid-stream crashes from breaking the UI by isolating validation from chunk emission.

---

## 14. COST OPTIMIZATION STRATEGY

- **Model Tiering**: 
  - \`gpt-4o-mini\` is used for Intent Classification, Context Synthesis, and Background Memory Extraction.
  - \`gpt-4o\` (or Claude 3.5 Sonnet) is reserved ONLY for the final user-facing response generation in heavy recommendation/guidance stages.
- **Dynamic Retrieval Limits**: \`intelligenceDepthController\` ensures new users only run Vector Searches for \`maxMemories: 1\`, preventing token waste on cold-start users.

---

## 15. PRODUCTION SCALING ROADMAP

- **Phase 1 (1k Users)**: Single robust monolithic Node instance + Managed DB/Redis.
- **Phase 2 (10k Users)**: Horizontal scaling of Node instances behind a Load Balancer. Dedicated BullMQ Worker nodes separated from the web/API nodes.
- **Phase 3 (100k+ Users)**: 
  - Sharded vector databases (or dedicated Pinecone/Qdrant cluster).
  - Dedicated microservices for Memory Extraction vs Core Chat.
  - Caching frequent queries (e.g., standard roadmaps) at the edge.

---

## 16. ENGINEERING BEST PRACTICES

- **Orchestration Discipline**: NEVER add features by just "appending to the prompt." Always use the router and dedicated engines.
- **Feature Flags**: Roll out changes to orchestration engines using a feature flag service (e.g., LaunchDarkly) to A/B test UX changes.
- **CI/CD**: GitHub Actions pipeline requiring passing unit tests on the \`intelligenceRouter\` before deployment to prevent regressions in UX safety.

---

## 17. API ARCHITECTURE OVERVIEW

### \`/api/chat\`
- **POST \`/message\`**: Main SSE endpoint. Requires JWT. Accepts \`{ message: string }\`. Yields \`{ type: "progress" | "text" | "error", data: string }\`.
- **GET \`/history\`**: Retrieves paginated \`ChatMessage\` rows.

### \`/api/document\`
- **POST \`/upload\`**: Accepts \`multipart/form-data\`. Uploads to S3, returns \`documentId\`, and kicks off background OCR/Chunking BullMQ job.

### \`/api/onboarding\`
- **POST \`/complete\`**: Updates \`User\` and \`UserProfile\`, transitioning the \`conversationStage\` from \`onboarding\` to \`exploration\`.

---

## 18. FINAL CTO ASSESSMENT

**Architecture Maturity**: Exceptionally High. The system exhibits a rare decoupling of deterministic routing and probabilistic generation.
**Production Readiness**: **Ready for Scaled Beta.** All critical UX safety guards, circuit breakers, and cost optimization layers are in place.
**Investor-Grade Evaluation**: Aarika represents a true "Agentic Operating System", moving far beyond typical GPT-wrappers. Its strongest moat is the \`intelligenceRouter\` and \`userComfortEngine\`, allowing it to build deep, non-creepy semantic relationships over time.
**Biggest Risks**: Dependence on OpenAI uptime. Recommend implementing a fallback adapter to Anthropic (Claude) or local OSS models for critical endpoints.
**Long-Term Opportunities**: Extending the \`executionStrategyEngine\` into an automated Agent that actually builds initial project scaffolding (repos, boilerplate) based on the generated roadmap.
`;

export default function ArchitectureGuide() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
        <div className="prose prose-slate prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {architectureGuideMarkdown}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
