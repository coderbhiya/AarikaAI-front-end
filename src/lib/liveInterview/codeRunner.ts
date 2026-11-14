// Runs the candidate's JavaScript in a throwaway Web Worker in THEIR browser — never on our
// server. `solution(input)` is called once per test case; the worker is killed on timeout.

export interface TestCase { input: unknown; output: unknown }
export interface TestResult { index: number; passed: boolean; expected: unknown; actual?: unknown; error?: string }
export interface RunResult { passed: number; total: number; results: TestResult[]; timedOut?: boolean; error?: string }

const WORKER_SRC = `
self.onmessage = (e) => {
  const { code, tests } = e.data;
  const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  let solution;
  try {
    solution = new Function(code + "\\n;return typeof solution === 'function' ? solution : undefined;")();
  } catch (err) {
    self.postMessage({ error: "Syntax error: " + err.message });
    return;
  }
  if (typeof solution !== "function") {
    self.postMessage({ error: "Define a function named solution(input)." });
    return;
  }
  const results = tests.map((t, i) => {
    try {
      const input = JSON.parse(JSON.stringify(t.input));
      const actual = solution(input);
      return { index: i + 1, passed: deepEqual(actual, t.output), expected: t.output, actual };
    } catch (err) {
      return { index: i + 1, passed: false, expected: t.output, error: String(err && err.message || err) };
    }
  });
  self.postMessage({ results });
};`;

export function runJavaScript(code: string, tests: TestCase[], timeoutMs = 3000): Promise<RunResult> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(new Blob([WORKER_SRC], { type: "text/javascript" }));
    const worker = new Worker(url);
    const done = (r: RunResult) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(r);
    };
    const timer = setTimeout(() => done({ passed: 0, total: tests.length, results: [], timedOut: true, error: `Stopped after ${timeoutMs / 1000}s — check for an infinite loop.` }), timeoutMs);
    worker.onmessage = (e: MessageEvent<{ results?: TestResult[]; error?: string }>) => {
      if (e.data.error) return done({ passed: 0, total: tests.length, results: [], error: e.data.error });
      const results = e.data.results || [];
      done({ passed: results.filter((r) => r.passed).length, total: tests.length, results });
    };
    worker.onerror = (e) => done({ passed: 0, total: tests.length, results: [], error: e.message || "Runtime error" });
    worker.postMessage({ code, tests });
  });
}
