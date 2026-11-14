// Soft colour fields behind screenshots: the page stays calm, the product pops.
export const TONES = {
  blue: "bg-gradient-to-br from-[#d6e4ff] via-[#e8eeff] to-[#f3eeff]",
  violet: "bg-gradient-to-br from-[#e6dcff] via-[#efe8ff] to-[#fbe9f3]",
  green: "bg-gradient-to-br from-[#d3efe0] via-[#e5f4ea] to-[#f1f8e6]",
  amber: "bg-gradient-to-br from-[#fde3c4] via-[#fdeedd] to-[#fbf3ea]",
  rose: "bg-gradient-to-br from-[#fdd9de] via-[#fde8ea] to-[#f7ecf8]",
  sky: "bg-gradient-to-br from-[#cfe9fb] via-[#e2f1fd] to-[#eef0ff]",
} as const;
export type Tone = keyof typeof TONES;

/** A real app screenshot on a soft colour field. Works in server and client components. */
export function Shot({ src, alt, w, h, tone = "blue", priority = false, eager = false }: { src: string; alt: string; w: number; h: number; tone?: Tone; priority?: boolean; eager?: boolean }) {
  return (
    <div className={`rounded-[24px] p-3 sm:p-6 lg:p-8 ${TONES[tone]}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={w}
        height={h}
        loading={priority || eager ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className="block h-auto w-full rounded-[12px] bg-white shadow-[0_24px_60px_-20px_rgba(20,20,40,0.35)] ring-1 ring-black/[0.06]"
      />
    </div>
  );
}
