import { Instrument_Serif } from "next/font/google";

// Editorial serif for landing-page headlines only (the app itself keeps Inter/Outfit).
export const displaySerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});
