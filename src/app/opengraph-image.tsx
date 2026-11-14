import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

// Social share card for aarikaai.in (WhatsApp, LinkedIn, X...). Pages that set their
// own openGraph.images keep theirs.
export const alt = "Aarika.AI: AI career co-pilot for students, job seekers and professionals in India";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await readFile(path.join(process.cwd(), "public", "aarika-logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  const chips = ["AI mock interviews", "Job Agent", "Resume Builder", "Mock exams"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #0b1220 0%, #111c3a 60%, #1d3a8a 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", background: "white", borderRadius: 20, padding: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={64} height={64} alt="" />
          </div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>Aarika.AI</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1.5 }}>From your first exam</div>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1.5, color: "#7aa7ff" }}>to your next job.</div>
          <div style={{ fontSize: 28, marginTop: 24, color: "#c7d2fe" }}>The AI career co-pilot for India. Free to sign up.</div>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {chips.map((c) => (
            <div key={c} style={{ display: "flex", fontSize: 24, padding: "10px 22px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.08)" }}>
              {c}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
