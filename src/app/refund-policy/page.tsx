import type { Metadata } from "next";
import RefundPolicy from "@/views/RefundPolicy";

export const metadata: Metadata = {
  title: "Refund & cancellation policy | Aarika.AI",
  description: "How cancellations and refunds work for Aarika.AI paid plans: one-time payments, no auto-renewal, and full refunds for failed or duplicate charges.",
  alternates: { canonical: "/refund-policy" },
};

export default function Page() {
  return <RefundPolicy />;
}
