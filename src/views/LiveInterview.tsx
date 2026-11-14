"use client";

// Live AI mock interview — a Google-Meet-style voice call with an AI interviewer.
// Flow: pre-join (camera/mic check + round setup) → call (hands-free, captions, coding panel)
// → report (content scores, speech feedback, coding result, transcript).
// Audio goes browser ⇄ AIML realtime directly; the camera never leaves the device.

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Mic, MicOff, Video, VideoOff, Captions, CaptionsOff, PhoneOff, Code2, Play, Loader2, Headphones,
  Clock, CheckCircle2, XCircle, ArrowLeft, Sparkles, ChevronDown, AlertTriangle, RotateCcw, Gauge, MessageSquareText, Monitor,
} from "lucide-react";
import { RealtimeInterviewClient, ToolCall } from "@/lib/liveInterview/realtimeClient";
import { CandidateCaptions, captionsSupported } from "@/lib/liveInterview/speechCaptions";
import { runJavaScript, RunResult } from "@/lib/liveInterview/codeRunner";
import {
  startLiveInterview, finishLiveInterview, CodingProblem, LiveInterviewSession, LiveInterviewType, Difficulty, TranscriptTurn,
} from "@/services/mockInterviewService";
import { useAuth } from "@/contexts/AuthContext";

type Stage = "prejoin" | "joining" | "call" | "finishing" | "report" | "error";

const PHASE_LABEL: Record<string, string> = {
  intro: "Introduction",
  about_you: "About you",
  core: "Core questions",
  coding: "Coding round",
  candidate_questions: "Your questions",
  wrap_up: "Wrap-up",
};

const fmt = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;

export default function LiveInterview() {
  const { user } = useAuth();
  const firstName = String((user as any)?.name || (user as any)?.displayName || "You").split(" ")[0];

  // ── setup ──
  const [stage, setStage] = useState<Stage>("prejoin");
  const [targetRole, setTargetRole] = useState("");
  const [interviewType, setInterviewType] = useState<LiveInterviewType>("hr");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [durationMin, setDurationMin] = useState<15 | 25>(15);
  const [error, setError] = useState<string | null>(null);
  const [fallbackToText, setFallbackToText] = useState(false);

  // ── media ──
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [micLevel, setMicLevel] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const callVideoRef = useRef<HTMLVideoElement | null>(null);

  // ── call ──
  const clientRef = useRef<RealtimeInterviewClient | null>(null);
  const captionsRef = useRef<CandidateCaptions | null>(null);
  const callStartRef = useRef(0);
  const turnsRef = useRef<TranscriptTurn[]>([]);
  const itemStartRef = useRef<Record<string, number>>({});
  const sessionIdRef = useRef<number | null>(null);
  const endingRef = useRef(false);
  const timeNoteSentRef = useRef(false);
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState("intro");
  const [captionsOn, setCaptionsOn] = useState(true);
  const [interviewerCaption, setInterviewerCaption] = useState("");
  const [candidateCaption, setCandidateCaption] = useState("");
  const [interviewerSpeaking, setInterviewerSpeaking] = useState(false);
  const [candidateSpeaking, setCandidateSpeaking] = useState(false);
  const [outLevel, setOutLevel] = useState(0);
  const [connNote, setConnNote] = useState<string | null>(null);
  const [captionsAvailable] = useState(() => captionsSupported());

  // ── coding ──
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [problem, setProblem] = useState<CodingProblem | null>(null);
  const [codeOpen, setCodeOpen] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const lastSharedCode = useRef("");

  // ── report ──
  const [report, setReport] = useState<LiveInterviewSession | null>(null);

  // Camera + mic preview for pre-join.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          video: { width: { ideal: 640 }, height: { ideal: 360 }, facingMode: "user" },
        });
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        setStream(s);
      } catch {
        try {
          const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
          if (cancelled) return s.getTracks().forEach((t) => t.stop());
          setStream(s);
          setCamOn(false);
          setMediaError("Camera not available. You can still interview with voice only.");
        } catch {
          setMediaError("Microphone access is needed for a live interview. Allow it in your browser's site settings, then reload.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Attach the stream to whichever <video> is mounted.
  useEffect(() => {
    for (const el of [videoRef.current, callVideoRef.current]) {
      if (el && stream && el.srcObject !== stream) el.srcObject = stream;
    }
  }, [stream, stage]);

  // Pre-join mic meter.
  useEffect(() => {
    if (!stream || stage !== "prejoin") return;
    const Ctx: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    const an = ctx.createAnalyser();
    an.fftSize = 512;
    ctx.createMediaStreamSource(stream).connect(an);
    const data = new Uint8Array(an.fftSize);
    const t = window.setInterval(() => {
      an.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += ((data[i] - 128) / 128) ** 2;
      setMicLevel(Math.sqrt(sum / data.length));
    }, 80);
    return () => {
      window.clearInterval(t);
      ctx.close();
    };
  }, [stream, stage]);

  // Camera / mic toggles apply to the real tracks.
  useEffect(() => {
    stream?.getVideoTracks().forEach((t) => (t.enabled = camOn));
  }, [camOn, stream]);
  useEffect(() => {
    stream?.getAudioTracks().forEach((t) => (t.enabled = micOn));
    clientRef.current?.setMuted(!micOn);
    captionsRef.current?.setMuted(!micOn);
  }, [micOn, stream]);

  // Stop everything if the user navigates away.
  useEffect(() => {
    return () => {
      captionsRef.current?.stop();
      clientRef.current?.close();
    };
  }, []);
  useEffect(() => () => stream?.getTracks().forEach((t) => t.stop()), [stream]);
  useEffect(() => {
    if (stage !== "call") return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [stage]);

  const now = () => Date.now() - callStartRef.current;

  const finishCall = useCallback(async (reason: string) => {
    if (endingRef.current) return;
    endingRef.current = true;
    setStage("finishing");
    captionsRef.current?.stop();
    clientRef.current?.close();
    stream?.getTracks().forEach((t) => t.stop());
    const id = sessionIdRef.current;
    if (!id) return;
    try {
      const durationSeconds = Math.round(now() / 1000);
      const r = await finishLiveInterview(id, {
        turns: turnsRef.current,
        durationSeconds,
        ...(problem && code.trim()
          ? { code: { problemId: problem.id, language, code, ...(runResult && { testsPassed: runResult.passed, testsTotal: runResult.total }) } }
          : {}),
      });
      setReport(r.session);
      setStage("report");
    } catch (e: any) {
      setError(e?.response?.data?.message || `Couldn't build your report (${reason}). Please check your connection.`);
      setStage("error");
    }
  }, [stream, problem, code, language, runResult]);

  const handleTool = useCallback((call: ToolCall) => {
    const client = clientRef.current;
    if (!client) return;
    if (call.name === "set_phase") {
      const p = String(call.args.phase || "");
      if (PHASE_LABEL[p]) setPhase(p);
      client.replyToTool(call.callId, { ok: true });
    } else if (call.name === "present_coding_problem") {
      const p = problems.find((x) => x.id === call.args.problemId) || problems[0];
      if (p) {
        setProblem(p);
        setCode(p.starter);
        setLanguage("javascript");
        setRunResult(null);
        setCodeOpen(true);
        setPhase("coding");
        client.replyToTool(call.callId, { opened: true, title: p.title, statement: p.statement, note: "The candidate now sees the problem and an editor. JavaScript can be run against sample tests." });
      } else {
        client.replyToTool(call.callId, { opened: false, error: "No coding problems available; continue verbally." });
      }
    } else if (call.name === "end_interview") {
      client.replyToTool(call.callId, { ok: true }, { continueSpeaking: false });
      client.waitForPlaybackEnd().then(() => finishCall("interviewer ended"));
    } else {
      client.replyToTool(call.callId, { error: "unknown tool" });
    }
  }, [problems, finishCall]);

  // Keep the tool handler current inside the client callbacks.
  const toolRef = useRef(handleTool);
  toolRef.current = handleTool;

  const join = async () => {
    if (!stream) return;
    setError(null);
    setFallbackToText(false);
    setStage("joining");
    try {
      const r = await startLiveInterview({ targetRole: targetRole.trim() || undefined, interviewType, difficulty, durationMin });
      sessionIdRef.current = r.session.id;
      setProblems(r.codingProblems || []);
      callStartRef.current = Date.now();
      turnsRef.current = [];
      endingRef.current = false;
      timeNoteSentRef.current = false;

      const client = new RealtimeInterviewClient({
        onStatus: (s, detail) => {
          if (s === "closed" && !endingRef.current) {
            setConnNote("Connection to the interviewer dropped. Your answers so far are saved — ending the interview.");
            finishCallRef.current("connection closed");
          } else if (s === "error") setConnNote(`Connection issue: ${detail || "retrying"}`);
        },
        onInterviewerCaption: (itemId, text, final) => {
          if (itemStartRef.current[itemId] === undefined) itemStartRef.current[itemId] = now();
          setInterviewerCaption(text);
          if (final && text.trim()) {
            turnsRef.current.push({ speaker: "interviewer", text: text.trim(), startMs: itemStartRef.current[itemId], endMs: now() });
          }
        },
        onInterviewerSpeaking: setInterviewerSpeaking,
        onCandidateSpeaking: (sp) => {
          setCandidateSpeaking(sp);
          if (sp) setInterviewerCaption("");
        },
        onMicLevel: setMicLevel,
        onOutputLevel: setOutLevel,
        onToolCall: (c) => toolRef.current(c),
        onError: (m) => setConnNote(m),
      });
      clientRef.current = client;
      client.setMuted(!micOn);
      await client.connect({ wsUrl: r.realtime.wsUrl, clientSecret: r.realtime.clientSecret, micStream: stream });

      if (captionsAvailable) {
        const cap = new CandidateCaptions(callStartRef.current, (interim, seg) => {
          setCandidateCaption(seg ? seg.text : interim);
          if (seg) turnsRef.current.push({ speaker: "candidate", ...seg });
        });
        cap.start();
        cap.setMuted(!micOn);
        captionsRef.current = cap;
      }
      setStage("call");
    } catch (e: any) {
      const status = e?.response?.status;
      const data = e?.response?.data;
      if (status === 503 || data?.fallback === "text") setFallbackToText(true);
      setError(data?.message || e?.message || "Couldn't start the interview. Please try again.");
      clientRef.current?.close();
      setStage("prejoin");
    }
  };

  const finishCallRef = useRef(finishCall);
  finishCallRef.current = finishCall;

  // Call timer, time checks and hard stop.
  useEffect(() => {
    if (stage !== "call") return;
    const t = window.setInterval(() => {
      const sec = Math.floor(now() / 1000);
      setElapsed(sec);
      const planned = durationMin * 60;
      if (!timeNoteSentRef.current && sec >= planned - 120) {
        timeNoteSentRef.current = true;
        clientRef.current?.addSystemNote("Time check: about 2 minutes left. Finish the current question, then move to candidate questions and wrap-up.");
      }
      if (sec >= planned + 180) finishCallRef.current("time limit");
    }, 1000);
    return () => window.clearInterval(t);
  }, [stage, durationMin]);

  // Share the editor with the interviewer (like a shared coding pad), debounced.
  useEffect(() => {
    if (stage !== "call" || !problem) return;
    const t = window.setTimeout(() => {
      const trimmed = code.trim();
      if (!trimmed || trimmed === lastSharedCode.current || trimmed === problem.starter.trim()) return;
      lastSharedCode.current = trimmed;
      clientRef.current?.addContext(`[Shared editor update — the candidate's current ${language} code for "${problem.title}". Do not read it aloud; use it to discuss their approach when relevant.]\n${trimmed.slice(0, 6000)}`);
    }, 5000);
    return () => window.clearTimeout(t);
  }, [code, language, problem, stage]);

  const runCode = async () => {
    if (!problem) return;
    setRunning(true);
    const r = await runJavaScript(code, problem.testCases);
    setRunResult(r);
    setRunning(false);
    clientRef.current?.addContext(
      `[Candidate ran their code: ${r.error ? `error — ${r.error}` : `${r.passed}/${r.total} sample tests passed`}. React briefly only if it is natural to do so.]`
    );
  };

  const remaining = Math.max(0, durationMin * 60 - elapsed);
  const ringScale = useMemo(() => 1 + Math.min(0.25, outLevel * 3), [outLevel]);

  // ─────────────────────────────────────────────────────────────────────────
  // PRE-JOIN
  // ─────────────────────────────────────────────────────────────────────────
  if (stage === "prejoin" || stage === "joining") {
    const bars = Math.min(10, Math.round(micLevel * 60));
    return (
      <div className="h-[100dvh] w-full bg-white overflow-y-auto overflow-x-hidden" data-testid="live-prejoin">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8">
          <a href="/mock-interview" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4" /> Mock interviews
          </a>
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 lg:gap-10 items-start">
            {/* Preview */}
            <div className="w-full min-w-0">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#202124] shadow-lg">
                {stream && camOn ? (
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover -scale-x-100" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-[#5f6368] flex items-center justify-center text-white text-4xl font-semibold">{firstName[0]?.toUpperCase()}</div>
                  </div>
                )}
                <div className="absolute top-3 left-3 text-white text-sm font-medium bg-black/40 rounded-md px-2 py-0.5">{firstName}</div>
                <div className="absolute bottom-4 inset-x-0 flex justify-center gap-4">
                  <RoundButton active={micOn} onClick={() => setMicOn((v) => !v)} label={micOn ? "Turn off microphone" : "Turn on microphone"}>
                    {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </RoundButton>
                  <RoundButton active={camOn} onClick={() => setCamOn((v) => !v)} label={camOn ? "Turn off camera" : "Turn on camera"} disabled={!stream?.getVideoTracks().length}>
                    {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </RoundButton>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 text-sm text-gray-600">
                <Mic className="w-4 h-4 shrink-0" />
                <div className="flex gap-0.5 items-end h-4" aria-label="Microphone level">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <span key={i} className={`w-1.5 rounded-sm ${i < bars && micOn ? "bg-emerald-500" : "bg-gray-200"}`} style={{ height: `${6 + i}px` }} />
                  ))}
                </div>
                <span className="truncate">{micOn ? "Say something to test your mic" : "Microphone is off"}</span>
              </div>
              {mediaError && (
                <p className="mt-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {mediaError}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-400">Your camera stays on your device. Only your voice goes to the AI interviewer during the call.</p>
            </div>

            {/* Setup */}
            <div className="w-full min-w-0">
              <h1 className="text-2xl sm:text-3xl font-normal text-gray-900">Ready to join?</h1>
              <p className="text-sm text-gray-500 mt-1">Aarika, your AI interviewer, is waiting in the room.</p>

              <div className="mt-5 space-y-4">
                <div>
                  <label htmlFor="li-role" className="text-sm font-semibold text-gray-800">Role you&apos;re interviewing for</label>
                  <input id="li-role" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} maxLength={120}
                    placeholder="Leave empty to use your profile's target role"
                    className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Round</p>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    {([["hr", "HR round", "Motivation, strengths, situations"], ["technical", "Technical round", "Concepts + live coding"]] as const).map(([id, label, desc]) => (
                      <button key={id} type="button" onClick={() => setInterviewType(id)} aria-pressed={interviewType === id}
                        className={`text-left rounded-xl border p-3 transition-colors ${interviewType === id ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                        <span className="block text-sm font-semibold text-gray-900">{label}</span>
                        <span className="block text-xs text-gray-500">{desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Segmented<Difficulty> label="Difficulty" value={difficulty} options={["easy", "medium", "hard"] as Difficulty[]} onChange={setDifficulty} />
                  <Segmented<15 | 25> label="Length" value={durationMin} options={[15, 25] as (15 | 25)[]} format={(v) => `${v} min`} onChange={setDurationMin} />
                </div>
                <ul className="text-xs text-gray-500 space-y-1.5">
                  <li className="flex gap-2"><Headphones className="w-4 h-4 shrink-0" /> Use headphones for the smoothest conversation.</li>
                  <li className="flex gap-2"><Monitor className="w-4 h-4 shrink-0" /> {captionsAvailable ? "Live captions are on. Chrome or Edge work best." : "Your browser can't caption your speech, so speech feedback will be limited. Chrome or Edge work best."}</li>
                  <li className="flex gap-2"><Sparkles className="w-4 h-4 shrink-0" /> Once you join, just talk. No buttons needed. The interviewer waits for you to finish.</li>
                </ul>

                {error && (
                  <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
                    {error}
                    {fallbackToText && (
                      <a href="/mock-interview" className="block mt-1 font-semibold underline">Take the text interview instead</a>
                    )}
                  </div>
                )}

                <button type="button" onClick={join} disabled={!stream || stage === "joining"} data-testid="join-now"
                  className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#1a73e8] hover:bg-[#1765cc] disabled:opacity-50 text-white text-sm font-semibold inline-flex items-center justify-center gap-2">
                  {stage === "joining" ? <><Loader2 className="w-4 h-4 animate-spin" /> Joining…</> : "Join now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FINISHING / ERROR
  // ─────────────────────────────────────────────────────────────────────────
  if (stage === "finishing") {
    return (
      <div className="min-h-[100dvh] bg-[#202124] text-white flex flex-col items-center justify-center gap-3 px-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-300" />
        <p className="text-lg">You left the interview</p>
        <p className="text-sm text-gray-400 max-w-sm">Preparing your feedback: scoring each answer and analysing your delivery. This takes up to a minute.</p>
      </div>
    );
  }
  if (stage === "error") {
    return (
      <div className="min-h-[100dvh] bg-white flex flex-col items-center justify-center gap-3 px-6 text-center">
        <AlertTriangle className="w-8 h-8 text-amber-500" />
        <p className="text-gray-800 max-w-md">{error}</p>
        <a href="/mock-interview" className="text-sm font-semibold text-blue-600 underline">Back to mock interviews</a>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // REPORT
  // ─────────────────────────────────────────────────────────────────────────
  if (stage === "report" && report) return <LiveReport session={report} />;

  // ─────────────────────────────────────────────────────────────────────────
  // IN CALL (Meet layout)
  // ─────────────────────────────────────────────────────────────────────────
  const showCode = codeOpen && !!problem;
  return (
    <div className="h-[100dvh] w-full bg-[#202124] text-white flex flex-col overflow-hidden" data-testid="live-call">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-3 sm:px-5 h-12 shrink-0">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-red-600/90 rounded px-2 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
        </span>
        <span className="text-sm text-gray-200 truncate min-w-0">{interviewType === "technical" ? "Technical" : "HR"} interview</span>
        <span className="hidden sm:inline text-xs text-gray-400 bg-white/10 rounded-full px-2.5 py-0.5">{PHASE_LABEL[phase] || "Interview"}</span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-sm tabular-nums text-gray-200" aria-label="Time remaining">
          <Clock className="w-4 h-4" /> {fmt(elapsed)} <span className="text-gray-500">/ {fmt(durationMin * 60)}</span>
        </span>
      </div>
      {connNote && (
        <div className="mx-3 mb-2 text-xs text-amber-200 bg-amber-900/40 border border-amber-700/50 rounded-lg px-3 py-1.5">{connNote}</div>
      )}

      {/* Stage */}
      <div className={`flex-1 min-h-0 px-2 sm:px-4 pb-2 flex ${showCode ? "flex-col lg:flex-row" : "flex-col"} gap-2 sm:gap-3`}>
        <div className={`relative min-h-0 ${showCode ? "lg:w-[34%] h-[38%] lg:h-auto flex lg:flex-col gap-2" : "flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3"}`}>
          {/* Interviewer tile */}
          <div className="relative flex-1 min-h-0 rounded-xl bg-[#3c4043] overflow-hidden flex items-center justify-center" data-testid="interviewer-tile">
            <div className="relative flex items-center justify-center">
              <span className={`absolute rounded-full transition-transform duration-100 ${interviewerSpeaking ? "bg-blue-400/30" : "bg-transparent"}`}
                style={{ width: 132, height: 132, transform: `scale(${interviewerSpeaking ? ringScale : 1})` }} />
              <div className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-600 flex items-center justify-center text-4xl font-semibold ${interviewerSpeaking ? "ring-4 ring-blue-400" : ""}`}>A</div>
            </div>
            <div className="absolute bottom-2 left-3 text-sm font-medium bg-black/40 rounded px-2 py-0.5">Aarika · Interviewer</div>
          </div>
          {/* Candidate tile */}
          <div className={`relative ${showCode ? "flex-1" : "flex-1"} min-h-0 rounded-xl bg-[#3c4043] overflow-hidden flex items-center justify-center ${candidateSpeaking && micOn ? "ring-2 ring-emerald-400" : ""}`} data-testid="candidate-tile">
            {camOn && stream?.getVideoTracks().length ? (
              <video ref={callVideoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover -scale-x-100" />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#5f6368] flex items-center justify-center text-3xl font-semibold">{firstName[0]?.toUpperCase()}</div>
            )}
            <div className="absolute bottom-2 left-3 text-sm font-medium bg-black/40 rounded px-2 py-0.5 inline-flex items-center gap-1.5">
              {!micOn && <MicOff className="w-3.5 h-3.5 text-red-400" />} You
            </div>
            {micOn && (
              <div className="absolute top-2 right-2 flex gap-0.5 items-end h-4" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-1 rounded-sm bg-emerald-400 transition-all" style={{ height: `${4 + Math.min(12, micLevel * 120 * (i === 1 ? 1.3 : 1))}px` }} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Coding panel */}
        {showCode && problem && (
          <div className="flex-1 min-h-0 min-w-0 rounded-xl bg-[#1e1f22] border border-white/10 flex flex-col overflow-hidden" data-testid="code-panel">
            <div className="px-3 sm:px-4 py-2.5 border-b border-white/10 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-300 shrink-0" />
              <span className="text-sm font-semibold truncate">{problem.title}</span>
              <span className="text-[11px] uppercase tracking-wide text-gray-400 bg-white/10 rounded px-1.5">{problem.difficulty}</span>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} aria-label="Language"
                className="ml-auto bg-[#2b2d31] border border-white/10 rounded-md text-xs px-2 py-1">
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
              <button type="button" onClick={() => setCodeOpen(false)} className="text-xs text-gray-400 hover:text-white px-1" aria-label="Hide code panel">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <div className="px-3 sm:px-4 py-2 text-sm text-gray-300 border-b border-white/10 max-h-28 overflow-y-auto">
              <p>{problem.statement}</p>
              <p className="mt-1 text-xs text-gray-400">Input: <code>{problem.inputFormat}</code> · Example: <code className="break-all">{JSON.stringify(problem.testCases[0]?.input)}</code> → <code>{JSON.stringify(problem.testCases[0]?.output)}</code></p>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Tab") {
                  e.preventDefault();
                  const el = e.currentTarget;
                  const { selectionStart: a, selectionEnd: b } = el;
                  const next = code.slice(0, a) + "  " + code.slice(b);
                  setCode(next);
                  requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = a + 2; });
                }
              }}
              spellCheck={false}
              aria-label="Code editor"
              className="flex-1 min-h-[140px] w-full resize-none bg-transparent px-3 sm:px-4 py-3 font-mono text-[13px] leading-5 text-gray-100 outline-none"
            />
            <div className="px-3 sm:px-4 py-2 border-t border-white/10 flex flex-wrap items-center gap-2">
              {language === "javascript" ? (
                <button type="button" onClick={runCode} disabled={running}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 rounded-md px-3 py-1.5">
                  {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />} Run tests
                </button>
              ) : (
                <span className="text-xs text-gray-400">Running is available for JavaScript. Your code is shared with the interviewer, so talk through it.</span>
              )}
              {runResult && (
                <span className={`text-xs ${runResult.error ? "text-red-300" : runResult.passed === runResult.total ? "text-emerald-300" : "text-amber-300"}`}>
                  {runResult.error ? runResult.error : `${runResult.passed}/${runResult.total} tests passed`}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Captions */}
      {captionsOn && (interviewerCaption || candidateCaption) && (
        <div className="px-3 sm:px-6 pb-2 shrink-0" aria-live="polite" data-testid="captions">
          <div className="mx-auto max-w-3xl bg-black/70 rounded-lg px-3 py-2 text-[15px] leading-snug space-y-1">
            {candidateSpeaking && candidateCaption ? (
              <p className="line-clamp-2"><span className="font-semibold text-emerald-300">You: </span>{candidateCaption}</p>
            ) : interviewerCaption ? (
              <p className="line-clamp-3"><span className="font-semibold text-blue-300">Aarika: </span>{interviewerCaption}</p>
            ) : candidateCaption ? (
              <p className="line-clamp-2"><span className="font-semibold text-emerald-300">You: </span>{candidateCaption}</p>
            ) : null}
          </div>
        </div>
      )}

      {/* Control bar */}
      <div className="relative shrink-0 h-[72px] flex items-center justify-center gap-3 sm:gap-4 px-3">
        <span className="hidden md:block absolute left-5 text-sm text-gray-300 tabular-nums">{fmt(remaining)} left</span>
        <RoundButton active={micOn} dark onClick={() => setMicOn((v) => !v)} label={micOn ? "Mute" : "Unmute"}>
          {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </RoundButton>
        <RoundButton active={camOn} dark onClick={() => setCamOn((v) => !v)} label={camOn ? "Turn off camera" : "Turn on camera"} disabled={!stream?.getVideoTracks().length}>
          {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </RoundButton>
        <RoundButton active={!captionsOn ? false : true} neutral dark onClick={() => setCaptionsOn((v) => !v)} label={captionsOn ? "Turn off captions" : "Turn on captions"}>
          {captionsOn ? <Captions className="w-5 h-5" /> : <CaptionsOff className="w-5 h-5" />}
        </RoundButton>
        {problem && !codeOpen && (
          <RoundButton active neutral dark onClick={() => setCodeOpen(true)} label="Show code editor">
            <Code2 className="w-5 h-5" />
          </RoundButton>
        )}
        <button type="button" onClick={() => finishCall("left")} aria-label="Leave interview" data-testid="end-call"
          className="h-12 px-6 rounded-full bg-[#ea4335] hover:bg-[#d93025] inline-flex items-center justify-center">
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ── small UI pieces ─────────────────────────────────────────────────────────

function RoundButton({ children, onClick, active, label, dark, neutral, disabled }: {
  children: React.ReactNode; onClick: () => void; active: boolean; label: string; dark?: boolean; neutral?: boolean; disabled?: boolean;
}) {
  const on = dark ? "bg-[#3c4043] hover:bg-[#4a4d51] text-white" : "bg-white/20 hover:bg-white/30 text-white border border-white/40";
  const off = neutral ? on : "bg-[#ea4335] hover:bg-[#d93025] text-white";
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} aria-pressed={active} disabled={disabled}
      className={`w-12 h-12 rounded-full inline-flex items-center justify-center transition-colors disabled:opacity-40 ${active ? on : off}`}>
      {children}
    </button>
  );
}

function Segmented<T extends string | number>({ label, value, options, onChange, format }: {
  label: string; value: T; options: T[]; onChange: (v: T) => void; format?: (v: T) => string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-800">{label}</p>
      <div className="mt-1.5 inline-flex rounded-xl border border-gray-200 p-1 bg-gray-50">
        {options.map((o) => (
          <button key={String(o)} type="button" onClick={() => onChange(o)} aria-pressed={value === o}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold capitalize ${value === o ? "bg-white shadow-sm text-blue-700" : "text-gray-500"}`}>
            {format ? format(o) : String(o)}
          </button>
        ))}
      </div>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number | null | undefined }) {
  const v = typeof value === "number" ? value : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-600"><span>{label}</span><span className="tabular-nums">{typeof value === "number" ? `${v}/10` : "–"}</span></div>
      <div className="mt-1 h-1.5 rounded-full bg-gray-100 overflow-hidden"><div className="h-full rounded-full bg-blue-600" style={{ width: `${v * 10}%` }} /></div>
    </div>
  );
}

function LiveReport({ session }: { session: LiveInterviewSession }) {
  const r = session.report;
  const sm = session.speechMetrics;
  const qById = new Map(session.questions.map((q) => [q.id, q]));
  return (
    <div className="h-[100dvh] bg-[#F8F9FA] overflow-y-auto overflow-x-hidden" data-testid="live-report">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <a href="/mock-interview" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"><ArrowLeft className="w-4 h-4" /> Mock interviews</a>
        <div className="rounded-2xl bg-gradient-to-r from-[#1E293B] to-[#1E1B4B] text-white p-5 sm:p-6">
          <p className="text-xs uppercase tracking-widest text-blue-200">Live {session.interviewType === "technical" ? "technical" : "HR"} interview · {session.targetRole}</p>
          <div className="mt-2 flex items-end gap-3 flex-wrap">
            <span className="text-5xl font-bold tabular-nums">{session.overallScore ?? "–"}</span>
            <span className="text-gray-300 mb-1.5">/ 100 overall</span>
            {session.durationSeconds ? <span className="ml-auto text-sm text-gray-300 mb-1.5">{fmt(session.durationSeconds)} call</span> : null}
          </div>
          {r?.summary && <p className="mt-3 text-sm text-gray-200 leading-relaxed">{r.summary}</p>}
        </div>

        {r?.captionsUnavailable && (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            We couldn&apos;t caption your answers in this browser, so answer scores and speech feedback are limited. Use Chrome or Edge next time.
          </p>
        )}

        {r && (r.strengths?.length || r.improvements?.length) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card title="What went well" icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">{r.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </Card>
            <Card title="Work on next" icon={<XCircle className="w-4 h-4 text-amber-600" />}>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">{r.improvements.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </Card>
          </div>
        ) : null}

        {sm?.available && (
          <Card title="How you spoke" icon={<Gauge className="w-4 h-4 text-blue-600" />} testId="speech-card">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <Stat label="Pace" value={sm.wpm ? `${sm.wpm} wpm` : "–"} hint={sm.pace || ""} />
              <Stat label="Filler words" value={String(sm.fillers.total)} hint={`${sm.fillers.per100Words}/100 words`} />
              <Stat label="Long pauses" value={String(sm.longPauses)} hint="over 4 seconds" />
              <Stat label="You talked" value={sm.talkRatio !== null ? `${Math.round(sm.talkRatio * 100)}%` : "–"} hint={`avg answer ${sm.avgAnswerSeconds}s`} />
            </div>
            {sm.fillers.top.length > 0 && (
              <p className="mt-3 text-xs text-gray-500">Most used fillers: {sm.fillers.top.map((f) => `"${f.word}" ×${f.count}`).join(", ")}</p>
            )}
            <ul className="mt-3 list-disc pl-5 space-y-1 text-sm text-gray-700">{sm.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </Card>
        )}

        {session.codeSubmission && (
          <Card title={`Coding round${session.codeSubmission.title ? ` · ${session.codeSubmission.title}` : ""}`} icon={<Code2 className="w-4 h-4 text-violet-600" />}>
            <p className="text-sm text-gray-700">
              {session.codeSubmission.testsTotal ? `${session.codeSubmission.testsPassed}/${session.codeSubmission.testsTotal} sample tests passed` : "Not run"} · {session.codeSubmission.language}
            </p>
            <pre className="mt-2 text-xs bg-gray-900 text-gray-100 rounded-lg p-3 overflow-x-auto max-h-64">{session.codeSubmission.code}</pre>
          </Card>
        )}

        {session.answers.length > 0 && (
          <Card title="Answer by answer" icon={<MessageSquareText className="w-4 h-4 text-blue-600" />}>
            <div className="space-y-4">
              {session.answers.map((a, i) => (
                <details key={a.questionId} className="group border-b border-gray-100 pb-3 last:border-0">
                  <summary className="cursor-pointer list-none flex gap-3 items-start">
                    <span className="text-xs font-bold text-gray-400 mt-0.5">Q{i + 1}</span>
                    <span className="flex-1 text-sm font-medium text-gray-900">{qById.get(a.questionId)?.text}</span>
                    <span className="text-sm font-bold tabular-nums text-blue-700">{a.score.overall}/10</span>
                  </summary>
                  <div className="mt-2 pl-7 space-y-2">
                    <p className="text-sm text-gray-600 italic">&ldquo;{a.text}&rdquo;</p>
                    <div className="grid grid-cols-3 gap-3"><ScoreBar label="Clarity" value={a.score.clarity} /><ScoreBar label="Relevance" value={a.score.relevance} /><ScoreBar label="Structure" value={a.score.structure} /></div>
                    <p className="text-sm text-gray-700">{a.feedback}</p>
                    {a.improvedAnswer && <p className="text-sm text-gray-700 bg-blue-50 rounded-lg p-3"><span className="font-semibold">Stronger answer: </span>{a.improvedAnswer}</p>}
                  </div>
                </details>
              ))}
            </div>
          </Card>
        )}

        {!!session.transcript?.length && (
          <details className="bg-white rounded-2xl border border-gray-200 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-gray-800">Full transcript</summary>
            <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
              {session.transcript.map((t, i) => (
                <p key={i} className="text-sm"><span className={`font-semibold ${t.speaker === "interviewer" ? "text-blue-700" : "text-emerald-700"}`}>{t.speaker === "interviewer" ? "Aarika" : "You"} <span className="text-gray-400 font-normal text-xs">{fmt(t.startMs / 1000)}</span>: </span>{t.text}</p>
              ))}
            </div>
          </details>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <a href="/mock-interview/live" className="px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm font-semibold inline-flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Another live interview</a>
          <a href="/mock-interview" className="px-5 py-2.5 rounded-full border border-gray-300 text-sm font-semibold text-gray-700">All mock interviews</a>
        </div>
      </div>
    </div>
  );
}

function Card({ title, icon, children, testId }: { title: string; icon: React.ReactNode; children: React.ReactNode; testId?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5" data-testid={testId}>
      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">{icon} {title}</h3>
      {children}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-900 tabular-nums">{value}</p>
      <p className="text-[11px] text-gray-500 capitalize">{hint}</p>
    </div>
  );
}
