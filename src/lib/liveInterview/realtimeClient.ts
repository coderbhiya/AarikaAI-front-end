// Browser client for the live (voice) mock interview.
// Talks to AIML's OpenAI-compatible realtime WebSocket with a short-lived client secret
// minted by our backend. Hands-free: the server detects when the candidate stops speaking
// (server VAD) and answers; when the candidate starts speaking, interviewer audio stops.

export type ToolCall = { name: string; callId: string; args: Record<string, unknown> };

export interface RealtimeHandlers {
  onStatus?: (s: "connecting" | "connected" | "closed" | "error", detail?: string) => void;
  /** Interviewer caption text as it streams; `final` once that utterance is complete. */
  onInterviewerCaption?: (itemId: string, text: string, final: boolean) => void;
  onInterviewerSpeaking?: (speaking: boolean) => void;
  onCandidateSpeaking?: (speaking: boolean) => void;
  onMicLevel?: (level: number) => void;
  onOutputLevel?: (level: number) => void;
  onToolCall?: (call: ToolCall) => void;
  onError?: (message: string) => void;
}

const OUTPUT_RATE = 24000;

const toBase64 = (buf: ArrayBuffer) => {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
};
const fromBase64 = (b64: string) => {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
};

export class RealtimeInterviewClient {
  private ws: WebSocket | null = null;
  private ctx: AudioContext | null = null;
  private micNode: AudioWorkletNode | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private outGain: GainNode | null = null;
  private outAnalyser: AnalyserNode | null = null;
  private playHead = 0; // AudioContext time when queued audio ends
  private playing: AudioBufferSourceNode[] = [];
  private currentItemId: string | null = null;
  private currentItemStartedAt = 0; // ctx time the current assistant item started playing
  private captions = new Map<string, string>();
  private muted = false;
  private candidateSpeaking = false;
  private levelTimer: number | null = null;
  private closed = false;

  constructor(private handlers: RealtimeHandlers = {}) {}

  get interviewerSpeaking() {
    return !!this.ctx && this.playHead > this.ctx.currentTime + 0.05;
  }

  /** Must be called from a user gesture (Join click) so audio can start. */
  async connect({ wsUrl, clientSecret, micStream }: { wsUrl: string; clientSecret: string; micStream: MediaStream }) {
    this.handlers.onStatus?.("connecting");
    const Ctx: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    this.ctx = new Ctx();
    await this.ctx.resume();

    // Output chain: queued PCM buffers → gain → analyser → speakers.
    this.outGain = this.ctx.createGain();
    this.outAnalyser = this.ctx.createAnalyser();
    this.outAnalyser.fftSize = 512;
    this.outGain.connect(this.outAnalyser).connect(this.ctx.destination);

    // Mic capture via AudioWorklet (24 kHz PCM16 chunks).
    await this.ctx.audioWorklet.addModule("/worklets/pcm-capture.js");
    this.micSource = this.ctx.createMediaStreamSource(micStream);
    this.micNode = new AudioWorkletNode(this.ctx, "pcm-capture");
    this.micNode.port.onmessage = (e: MessageEvent<{ pcm: ArrayBuffer; level: number }>) => this.onMicChunk(e.data.pcm, e.data.level);
    this.micSource.connect(this.micNode);
    // The worklet must be pulled by the graph; route it through a muted gain.
    const sink = this.ctx.createGain();
    sink.gain.value = 0;
    this.micNode.connect(sink).connect(this.ctx.destination);

    this.levelTimer = window.setInterval(() => this.emitOutputLevel(), 80);

    await new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(wsUrl, ["realtime", `openai-insecure-api-key.${clientSecret}`]);
      this.ws = ws;
      let opened = false;
      ws.onopen = () => {
        opened = true;
        this.handlers.onStatus?.("connected");
        // Ask the interviewer to begin (the session instructions end with "Start now with the intro").
        this.send({ type: "response.create" });
        resolve();
      };
      ws.onerror = () => {
        if (!opened) reject(new Error("Could not connect to the interviewer."));
        this.handlers.onStatus?.("error", "connection error");
      };
      ws.onclose = (ev) => {
        if (!opened) reject(new Error(`Connection closed (${ev.code})`));
        if (!this.closed) this.handlers.onStatus?.("closed", ev.reason || String(ev.code));
      };
      ws.onmessage = (m) => this.onEvent(JSON.parse(String(m.data)));
    });
  }

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  /** Context for the interviewer that should not trigger a spoken reply (e.g. shared code). */
  addContext(text: string, { respond = false } = {}) {
    this.send({
      type: "conversation.item.create",
      item: { type: "message", role: "user", content: [{ type: "input_text", text }] },
    });
    if (respond) this.send({ type: "response.create" });
  }

  /** System note (time checks etc.). */
  addSystemNote(text: string) {
    this.send({ type: "conversation.item.create", item: { type: "message", role: "system", content: [{ type: "input_text", text }] } });
  }

  replyToTool(callId: string, output: unknown, { continueSpeaking = true } = {}) {
    this.send({ type: "conversation.item.create", item: { type: "function_call_output", call_id: callId, output: JSON.stringify(output ?? { ok: true }) } });
    if (continueSpeaking) this.send({ type: "response.create" });
  }

  /** Resolves once queued interviewer audio has finished playing (for a graceful hang-up). */
  async waitForPlaybackEnd(maxMs = 15000) {
    const start = Date.now();
    while (this.interviewerSpeaking && Date.now() - start < maxMs) await new Promise((r) => setTimeout(r, 150));
  }

  close() {
    this.closed = true;
    if (this.levelTimer) window.clearInterval(this.levelTimer);
    this.stopPlayback();
    try { this.ws?.close(1000, "ended"); } catch { /* already closed */ }
    try { this.micSource?.disconnect(); this.micNode?.disconnect(); } catch { /* ignore */ }
    try { this.ctx?.close(); } catch { /* ignore */ }
    this.handlers.onStatus?.("closed", "ended");
  }

  // ── internals ──────────────────────────────────────────────────────────

  private send(ev: unknown) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(ev));
  }

  private onMicChunk(pcm: ArrayBuffer, level: number) {
    this.handlers.onMicLevel?.(this.muted ? 0 : level);
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    // While the interviewer is talking through speakers, only forward clearly-louder speech
    // so its own voice (echo) doesn't trigger a false interruption. Headphones avoid this entirely.
    const gated = this.muted || (this.interviewerSpeaking && level < 0.045);
    const data = gated ? new Int16Array(pcm.byteLength / 2).buffer : pcm;
    this.send({ type: "input_audio_buffer.append", audio: toBase64(data) });
  }

  private onEvent(ev: any) {
    switch (ev.type) {
      case "response.output_audio.delta":
      case "response.audio.delta":
        if (ev.delta) this.enqueueAudio(ev.item_id, fromBase64(ev.delta));
        break;
      case "response.output_audio_transcript.delta":
      case "response.audio_transcript.delta": {
        const text = (this.captions.get(ev.item_id) || "") + (ev.delta || "");
        this.captions.set(ev.item_id, text);
        this.handlers.onInterviewerCaption?.(ev.item_id, text, false);
        break;
      }
      case "response.output_audio_transcript.done":
      case "response.audio_transcript.done": {
        const text = ev.transcript ?? this.captions.get(ev.item_id) ?? "";
        this.captions.set(ev.item_id, text);
        this.handlers.onInterviewerCaption?.(ev.item_id, text, true);
        break;
      }
      case "input_audio_buffer.speech_started":
        this.candidateSpeaking = true;
        this.handlers.onCandidateSpeaking?.(true);
        this.bargeIn();
        break;
      case "input_audio_buffer.speech_stopped":
        this.candidateSpeaking = false;
        this.handlers.onCandidateSpeaking?.(false);
        break;
      case "response.function_call_arguments.done": {
        let args: Record<string, unknown> = {};
        try { args = JSON.parse(ev.arguments || "{}"); } catch { /* keep empty */ }
        this.handlers.onToolCall?.({ name: ev.name, callId: ev.call_id, args });
        break;
      }
      case "error": {
        const msg = ev.error?.message || "Unknown realtime error";
        // Cancelling when nothing is playing is harmless; don't surface it.
        if (!/no active response|cancellation failed/i.test(msg)) this.handlers.onError?.(msg);
        break;
      }
      default:
        break;
    }
  }

  private enqueueAudio(itemId: string, buf: ArrayBuffer) {
    if (!this.ctx || !this.outGain) return;
    const int16 = new Int16Array(buf);
    const audio = this.ctx.createBuffer(1, int16.length, OUTPUT_RATE);
    const ch = audio.getChannelData(0);
    for (let i = 0; i < int16.length; i++) ch[i] = int16[i] / 0x8000;
    const src = this.ctx.createBufferSource();
    src.buffer = audio;
    src.connect(this.outGain);
    const now = this.ctx.currentTime;
    const startAt = Math.max(now + 0.03, this.playHead);
    if (this.currentItemId !== itemId) {
      this.currentItemId = itemId;
      this.currentItemStartedAt = startAt;
    }
    src.start(startAt);
    this.playHead = startAt + audio.duration;
    this.playing.push(src);
    src.onended = () => {
      this.playing = this.playing.filter((s) => s !== src);
      if (!this.interviewerSpeaking) this.handlers.onInterviewerSpeaking?.(false);
    };
    this.handlers.onInterviewerSpeaking?.(true);
  }

  /** Candidate started talking: stop interviewer audio and tell the server how much was heard. */
  private bargeIn() {
    if (!this.ctx || !this.interviewerSpeaking || !this.currentItemId) return;
    const heardMs = Math.max(0, Math.round((this.ctx.currentTime - this.currentItemStartedAt) * 1000));
    this.stopPlayback();
    this.send({ type: "conversation.item.truncate", item_id: this.currentItemId, content_index: 0, audio_end_ms: heardMs });
  }

  private stopPlayback() {
    for (const s of this.playing) {
      try { s.stop(); } catch { /* already stopped */ }
    }
    this.playing = [];
    if (this.ctx) this.playHead = this.ctx.currentTime;
    this.handlers.onInterviewerSpeaking?.(false);
  }

  private emitOutputLevel() {
    if (!this.outAnalyser || !this.handlers.onOutputLevel) return;
    const data = new Uint8Array(this.outAnalyser.fftSize);
    this.outAnalyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128;
      sum += v * v;
    }
    this.handlers.onOutputLevel(Math.sqrt(sum / data.length));
  }
}
