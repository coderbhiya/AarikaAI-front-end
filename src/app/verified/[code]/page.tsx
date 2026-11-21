import type { Metadata } from "next";
import { PublicPage } from "@/components/landing/Site";
import VerifiedBadge from "@/views/VerifiedBadge";

export const metadata: Metadata = {
  title: "Verified candidate | Aarika.AI",
  description: "Check an AarikaAI Verified badge: the role, the AI interview score and a short summary.",
  robots: { index: false, follow: false },
};

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return (
    <PublicPage cta={false}>
      <VerifiedBadge code={code} />
    </PublicPage>
  );
}
