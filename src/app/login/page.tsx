import type { Metadata } from "next";
import Auth from "@/views/Auth";

export const metadata: Metadata = {
  title: "Log in | Aarika.AI",
  description: "Log in to Aarika.AI, your AI career co-pilot.",
  alternates: { canonical: "https://aarikaai.in/login" },
};

export default function Page() {
  return <Auth />;
}
