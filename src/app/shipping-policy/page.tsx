import type { Metadata } from "next";
import ShippingPolicy from "@/views/ShippingPolicy";

export const metadata: Metadata = {
  title: "Shipping & delivery policy | Aarika.AI",
  description: "Aarika.AI is an online service: paid plans are activated on your account as soon as Razorpay confirms the payment. Nothing physical is shipped.",
  alternates: { canonical: "/shipping-policy" },
};

export default function Page() {
  return <ShippingPolicy />;
}
