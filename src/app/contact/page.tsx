import type { Metadata } from "next";
import Contact from "@/views/Contact";

export const metadata: Metadata = {
  title: "Contact | Aarika.AI",
  description: "Contact SenseforgeAI, the team behind Aarika.AI: email dave@senseforge.in or call +91 91746 99025.",
  alternates: { canonical: "/contact" },
};

export default function Page() {
  return <Contact />;
}
