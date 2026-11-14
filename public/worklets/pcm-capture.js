// AudioWorklet: captures mono mic audio, resamples to 24 kHz and posts 16-bit PCM chunks
// (~100 ms each) plus an RMS level to the main thread. Used by the live mock interview.
class PcmCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.targetRate = 24000;
    this.ratio = sampleRate / this.targetRate; // e.g. 48000 / 24000 = 2
    this.chunkSamples = 2400; // 100 ms at 24 kHz
    this.out = new Int16Array(this.chunkSamples);
    this.outLen = 0;
    this.pos = 0; // fractional read position into the current input block
    this.sumSq = 0;
    this.count = 0;
  }

  process(inputs) {
    const input = inputs[0];
    const ch = input && input[0];
    if (!ch || ch.length === 0) return true;

    // Linear-interpolation resample from sampleRate → 24 kHz.
    while (this.pos < ch.length - 1) {
      const i = Math.floor(this.pos);
      const frac = this.pos - i;
      const s = ch[i] + (ch[i + 1] - ch[i]) * frac;
      const clamped = Math.max(-1, Math.min(1, s));
      this.out[this.outLen++] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
      this.sumSq += clamped * clamped;
      this.count++;
      if (this.outLen === this.chunkSamples) {
        const level = Math.sqrt(this.sumSq / this.count);
        this.port.postMessage({ pcm: this.out.buffer, level }, [this.out.buffer]);
        this.out = new Int16Array(this.chunkSamples);
        this.outLen = 0;
        this.sumSq = 0;
        this.count = 0;
      }
      this.pos += this.ratio;
    }
    this.pos -= ch.length;
    if (this.pos < 0) this.pos = 0;
    return true;
  }
}

registerProcessor("pcm-capture", PcmCaptureProcessor);
