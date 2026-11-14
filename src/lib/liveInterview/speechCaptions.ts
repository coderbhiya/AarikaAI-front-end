// Live captions for the candidate using the browser's speech recognition (Chrome/Edge/
// Android Chrome). The realtime provider doesn't return the candidate's transcript, so this
// is also what we score and analyse after the call. Timestamps are ms since call start.

export interface CaptionSegment {
  text: string;
  startMs: number;
  endMs: number;
}

export const captionsSupported = () =>
  typeof window !== "undefined" && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

export class CandidateCaptions {
  private rec: any = null;
  private running = false;
  private segStart: Record<number, number> = {};
  private muted = false;

  constructor(
    private callStart: number,
    private onUpdate: (interim: string, finalSeg?: CaptionSegment) => void,
    private lang = "en-IN"
  ) {}

  start() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return false;
    this.rec = new SR();
    this.rec.lang = this.lang;
    this.rec.continuous = true;
    this.rec.interimResults = true;
    this.rec.maxAlternatives = 1;
    this.rec.onresult = (ev: any) => {
      if (this.muted) return;
      const now = Date.now() - this.callStart;
      let interim = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i];
        if (this.segStart[i] === undefined) this.segStart[i] = now;
        const text = String(r[0]?.transcript || "").trim();
        if (r.isFinal) {
          if (text) this.onUpdate("", { text, startMs: this.segStart[i], endMs: now });
          delete this.segStart[i];
        } else {
          interim += (interim ? " " : "") + text;
        }
      }
      this.onUpdate(interim);
    };
    // Chrome stops recognition after silence or ~60s; restart while the call is running.
    this.rec.onend = () => {
      this.segStart = {};
      if (this.running) {
        try { this.rec.start(); } catch { /* already started */ }
      }
    };
    this.rec.onerror = (e: any) => {
      if (e?.error === "not-allowed" || e?.error === "service-not-allowed") this.running = false;
    };
    this.running = true;
    try { this.rec.start(); } catch { /* ignore */ }
    return true;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  stop() {
    this.running = false;
    try { this.rec?.stop(); } catch { /* ignore */ }
  }
}
