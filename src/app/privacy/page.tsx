import type { Metadata } from "next";
import Privacy from "@/views/Privacy";

export const metadata: Metadata = {
  title: "Privacy policy | Aarika.AI",
  description: "How Aarika.AI, run by SenseforgeAI, collects, uses and protects your personal information.",
  alternates: { canonical: "/privacy" },
};

export default function Page() {
  return <Privacy />;
}
