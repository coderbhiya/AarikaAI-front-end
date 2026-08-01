import About from "../../views/About";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Aarika.AI - Next-Gen AI Career & Exam Intelligence",
  description: "Aarika.AI by Senseforge is India's leading AI career co-pilot and adaptive exam simulator for CA Foundation, UPSC, NEET, JEE, and NIMCET aspirants. Discover our mission and MemoryOS technology.",
  keywords: ["Aarika.AI", "Aarika AI", "Senseforge", "AI Career Guidance", "CA Foundation Mock Test", "UPSC AI Preparation", "NIMCET Mock Test", "Resume Intelligence"],
  openGraph: {
    title: "About Aarika.AI - Next-Gen AI Career & Exam Intelligence",
    description: "Empowering career trajectories and adaptive exam simulations with Aarika.AI MemoryOS by Senseforge.",
    url: "https://aarikaai.in/about",
    siteName: "Aarika.AI",
    type: "website",
  },
};

export default function Page() {
  return <About />;
}
