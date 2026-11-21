import type { Metadata } from "next";
import PricingPage from "@/views/PricingPage";

export const metadata: Metadata = {
  title: "Pricing | Aarika.AI",
  description: "Aarika.AI plans and prices in rupees: Basic ₹299/month and Professional ₹699/month, with yearly discounts. GST extra. Pay via Razorpay.",
  alternates: { canonical: "/pricing" },
};

export default function Page() {
  return <PricingPage />;
}
