import type { Metadata } from "next";
import Termandconditions from "@/views/Termandconditions";

export const metadata: Metadata = {
  title: "Terms of service | Aarika.AI",
  description: "The terms that apply when you use Aarika.AI, the AI career co-pilot run by SenseforgeAI.",
  alternates: { canonical: "/terms" },
};

export default function Page() {
  return <Termandconditions />;
}
